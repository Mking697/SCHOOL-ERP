import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import * as catalog from "../src/lib/commercial-catalog";

const helperPath = "../src/lib/subscription-checkout.ts";
type PaymentResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type CheckoutOptions = { order_id: string; handler: (response: PaymentResponse) => Promise<void>; modal: { ondismiss: () => void } };

function fixture(fetchImpl?: typeof fetch) {
  let checkoutOptions: CheckoutOptions;
  let failureHandler: (response: { error: { description: string } }) => void;
  let opens = 0;
  let closes = 0;
  let success = 0;
  let cancelled = 0;
  const busy: boolean[] = [];
  const errors: (string | null)[] = [];
  const requests: { url: string; body: Record<string, unknown> }[] = [];
  class Checkout {
    constructor(options: CheckoutOptions) { checkoutOptions = options; }
    open() { opens++; }
    close() { closes++; checkoutOptions.modal.ondismiss(); }
    on(_event: string, handler: typeof failureHandler) { failureHandler = handler; }
  }
  const deps = {
    schoolName: "Local QA School",
    loadCheckout: async () => Checkout,
    onBusyChange: (value: boolean) => busy.push(value),
    onError: (message: string | null) => errors.push(message),
    onCancelled: () => { cancelled++; },
    onVerified: () => { success++; },
    fetchImpl: fetchImpl ?? (async (url: string, init: RequestInit) => {
      requests.push({ url, body: JSON.parse(String(init.body)) });
      return url.endsWith("/order")
        ? Response.json({ keyId: "public-test-key", order: { id: "order_server", amount: 500000, currency: "INR" } })
        : Response.json({ ok: true });
    }),
  };
  return { deps, requests, busy, errors, get options() { return checkoutOptions; }, get fail() { return failureHandler; }, get opens() { return opens; }, get closes() { return closes; }, get success() { return success; }, get cancelled() { return cancelled; } };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}

const payment = { razorpay_order_id: "order_server", razorpay_payment_id: "pay_test", razorpay_signature: "a".repeat(64) };
const orderResponse = () => Response.json({ keyId: "public-test-key", order: { id: "order_server", amount: 500000, currency: "INR" } });

test("disposed delayed order never opens checkout after a replacement starts", async () => {
  const { createSubscriptionCheckout } = await import(helperPath);
  const order = deferred<Response>();
  let orderSignal: AbortSignal | null | undefined;
  const abandoned = fixture(async (_url: RequestInfo | URL, init?: RequestInit) => {
    orderSignal = init?.signal;
    return order.promise;
  });
  const old = createSubscriptionCheckout(abandoned.deps);
  const pending = old.start("MONTHLY");
  old.dispose?.();
  const replacement = fixture();
  await createSubscriptionCheckout(replacement.deps).start("YEARLY");
  order.resolve(orderResponse());
  await pending;
  assert.equal(abandoned.opens, 0);
  assert.equal(orderSignal?.aborted, true);
  assert.deepEqual(abandoned.busy, [true]);
  assert.deepEqual(abandoned.errors, [null]);
  await old.start("MONTHLY");
  assert.equal(abandoned.opens, 0);
  assert.equal(replacement.opens, 1);
});

test("disposed delayed shared script never opens an abandoned checkout", async () => {
  const { createSubscriptionCheckout, createCheckoutScriptLoader } = await import(helperPath);
  const f = fixture();
  const Constructor = await f.deps.loadCheckout();
  let ready: typeof Constructor | undefined = undefined;
  let loaded = () => {};
  let loads = 0;
  const waiting = deferred<void>();
  const load = createCheckoutScriptLoader({
    getConstructor: () => ready,
    attachScript: (onLoad: () => void) => { loads++; loaded = onLoad; waiting.resolve(); return () => {}; },
  });
  f.deps.loadCheckout = load;
  const old = createSubscriptionCheckout(f.deps);
  const first = old.start("MONTHLY");
  await waiting.promise;
  old.dispose?.();
  const replacement = createSubscriptionCheckout(f.deps);
  const second = replacement.start("YEARLY");
  ready = Constructor;
  loaded();
  await Promise.all([first, second]);
  assert.equal(loads, 1);
  assert.equal(f.opens, 1);
  assert.deepEqual(f.busy, [true, true]);
  assert.deepEqual(f.errors, [null, null]);
});

test("disposal closes only its owned modal and ignores all stale SDK callbacks", async () => {
  const { createSubscriptionCheckout } = await import(helperPath);
  const f = fixture();
  const old = createSubscriptionCheckout(f.deps);
  await old.start("MONTHLY");
  const options = f.options;
  const fail = f.fail;
  old.dispose();
  old.dispose();
  const replacement = fixture();
  await createSubscriptionCheckout(replacement.deps).start("YEARLY");
  fail({ error: { description: "Stale failure" } });
  options.modal.ondismiss();
  await options.handler(payment);
  await old.start("YEARLY");
  assert.equal(f.closes, 1);
  assert.equal(replacement.closes, 0);
  assert.equal(replacement.opens, 1);
  assert.equal(f.opens, 1);
  assert.equal(f.requests.length, 1);
  assert.equal(f.success, 0);
  assert.equal(f.cancelled, 0);
  assert.deepEqual(f.busy, [true]);
  assert.deepEqual(f.errors, [null]);
});

for (const ok of [true, false]) {
  test(`disposal allows in-flight verification ${ok ? "success" : "failure"} to finish without stale UI or reload`, async () => {
    const { createSubscriptionCheckout } = await import(helperPath);
    const verification = deferred<Response>();
    let verifySignal: AbortSignal | null | undefined;
    let verifyRequests = 0;
    const f = fixture(async (url: RequestInfo | URL, init?: RequestInit) => {
      if (String(url).endsWith("/order")) return orderResponse();
      verifyRequests++;
      verifySignal = init?.signal;
      return verification.promise;
    });
    const old = createSubscriptionCheckout(f.deps);
    await old.start("MONTHLY");
    const options = f.options;
    const pending = options.handler(payment);
    old.dispose();
    verification.resolve(Response.json({ ok }, { status: ok ? 200 : 409 }));
    await pending;
    options.modal.ondismiss();
    f.fail({ error: { description: "Stale failure" } });
    await options.handler(payment);
    assert.equal(verifyRequests, 1);
    assert.equal(verifySignal?.aborted, false);
    assert.equal(f.success, 0);
    assert.equal(f.cancelled, 0);
    assert.equal(f.closes, 1);
    assert.deepEqual(f.busy, [true]);
    assert.deepEqual(f.errors, [null]);
  });
}

type CreateController = typeof import("../src/lib/subscription-checkout").createSubscriptionCheckout;
type Controller = ReturnType<CreateController>;
type Dependencies = Parameters<CreateController>[0];
type Element = {
  type: unknown;
  key?: string;
  props: {
    schoolName?: string;
    pricingTier?: unknown;
    children?: Element | Element[];
    onClick?: () => Promise<void>;
    onChange?: (event: { target: { value: string } }) => void;
    disabled?: boolean;
    value?: string;
    role?: string;
  };
};

// A dependency-free hook harness: preserve slots on rerender, compare effect
// dependencies, and unmount/remount child frames only when type/key changes.
async function gateFixture(f: ReturnType<typeof fixture>) {
  const api = await import(helperPath);
  type Effect = { setup: () => () => void; deps: unknown[]; cleanup?: () => void; pending: boolean };
  type Frame = { type: unknown; key?: string; slots: unknown[]; effects: Effect[]; mounted: boolean };
  const frames: Frame[] = [];
  const controllers: Controller[] = [];
  const updates: unknown[] = [];
  let active: Frame;
  let slot = 0;
  let effectIndex = 0;
  let rendering = false;
  let tree: Element;
  let reloads = 0;
  let schoolName = "Local QA School";
  let pricingTier: unknown = undefined;
  const unmount = (frame: Frame) => {
    frame.mounted = false;
    for (const effect of frame.effects) effect.cleanup?.();
  };
  const react = {
    useState: (initial: unknown) => {
      const frame = active;
      const index = slot++;
      if (!(index in frame.slots)) frame.slots[index] = initial;
      return [frame.slots[index], (value: unknown) => {
        updates.push(value);
        if (frame.mounted) frame.slots[index] = typeof value === "function" ? value(frame.slots[index]) : value;
      }];
    },
    useRef: (initial: unknown) => {
      const index = slot++;
      if (!(index in active.slots)) active.slots[index] = new Proxy({ current: initial }, {
        set(target, property, value) {
          assert.equal(rendering, false, "Controller ref must not be mutated during render");
          return Reflect.set(target, property, value);
        },
      });
      return active.slots[index];
    },
    useEffect: (setup: Effect["setup"], deps: unknown[]) => {
      const index = effectIndex++;
      const previous = active.effects[index];
      const changed = !previous || deps.length !== previous.deps.length || deps.some((dep, i) => !Object.is(dep, previous.deps[i]));
      active.effects[index] = { setup, deps, cleanup: previous?.cleanup, pending: changed };
    },
  };
  const jsx = (type: unknown, props: Element["props"], key?: string) => ({ type, props, key });
  const exports: { default?: (props: { schoolName: string; pricingTier?: unknown }) => Element } = {};
  const source = readFileSync(new URL("../src/components/subscription-gate.tsx", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText;
  runInNewContext(compiled, {
    exports,
    window: { location: { reload: () => { reloads++; } } },
    require: (name: string) => {
      if (name === "react") return react;
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "lucide-react") return { ShieldAlert: () => null };
      if (name === "@/lib/commercial-catalog") return catalog;
      if (name === "@/lib/subscription-checkout") return {
        loadRazorpayCheckout: f.deps.loadCheckout,
        createSubscriptionCheckout: (deps: Dependencies) => {
          assert.equal(rendering, false, "Controller must be created in effect, not render");
          const controller = api.createSubscriptionCheckout({ ...deps, fetchImpl: f.deps.fetchImpl });
          controllers.push(controller);
          return controller;
        },
      };
      throw new Error(`Unexpected component import: ${name}`);
    },
  });
  assert.ok(exports.default);
  const render = (nextName = schoolName, nextTier: unknown = pricingTier) => {
    schoolName = nextName;
    pricingTier = nextTier;
    let element: Element = jsx(exports.default, { schoolName, pricingTier });
    let depth = 0;
    while (typeof element.type === "function") {
      const previous = frames[depth];
      if (!previous || previous.type !== element.type || previous.key !== element.key) {
        for (const frame of frames.splice(depth)) unmount(frame);
        frames[depth] = { type: element.type, key: element.key, slots: [], effects: [], mounted: true };
      }
      active = frames[depth++];
      slot = 0;
      effectIndex = 0;
      rendering = true;
      try { element = element.type(element.props); } finally { rendering = false; }
    }
    tree = element;
    for (const frame of frames) for (const effect of frame.effects) {
      if (!effect.pending) continue;
      effect.cleanup?.();
      effect.cleanup = effect.setup();
      effect.pending = false;
    }
  };
  const find = (type: string, element = tree): Element | undefined => {
    if (!element || typeof element !== "object") return;
    if (element.type === type || element.props?.role === type) return element;
    const children = element.props?.children;
    for (const child of Array.isArray(children) ? children : [children]) {
      if (!child) continue;
      const found = find(type, child);
      if (found) return found;
    }
  };
  const controls = (busy: boolean) => {
    assert.equal(find("button")?.props.disabled, busy, "Pay Now must reflect the current controller busy state");
    assert.equal(find("select")?.props.disabled, busy, "Plan selection must reflect the current controller busy state");
  };
  render();
  return {
    render, find, controls, controllers, updates,
    options: () => {
      const children = find("select")?.props.children;
      return (Array.isArray(children) ? children : [children]).flat().filter((child): child is Element => Boolean(child) && typeof child === "object").map(option => ({ value: option.props.value, text: (Array.isArray(option.props.children) ? option.props.children : [option.props.children]).join("") }));
    },
    get reloads() { return reloads; },
    click: () => {
      const button = find("button");
      assert.ok(button?.props.onClick);
      assert.equal(button.props.disabled, false, "User cannot click a disabled Pay Now button");
      return button.props.onClick();
    },
    replayEffects: () => {
      for (const frame of frames) for (const effect of frame.effects) {
        effect.cleanup?.();
        effect.cleanup = effect.setup();
      }
    },
    unmount: () => { for (const frame of frames.splice(0)) unmount(frame); },
  };
}

test("SubscriptionGate displays only the vendor-selected tier's three renewal prices with safe legacy fallback", async () => {
  const f = fixture();
  const gate = await gateFixture(f);
  for (const [tier, prices] of [
    ["STARTER", ["2,000", "10,800", "20,400"]],
    ["GROWTH", ["3,000", "16,200", "30,600"]],
    ["PROFESSIONAL", ["5,000", "27,000", "51,000"]],
    [undefined, ["5,000", "27,000", "51,000"]],
    ["invalid", ["5,000", "27,000", "51,000"]],
  ] as const) {
    gate.render("Local QA School", tier);
    const options = gate.options();
    assert.deepEqual(options.map(option => option.value), ["MONTHLY", "HALF_YEARLY", "YEARLY"]);
    prices.forEach((price, index) => assert.ok(options[index].text.includes(price), `${tier} missing ${price}`));
  }
  await gate.click();
  assert.deepEqual(f.requests[0].body, { plan: "MONTHLY" }, "Browser must send only the cycle, not display tier or amount");
  gate.unmount();
});

// This also guards the harness: a same-school rerender MUST preserve busy state,
// refs and effect identity rather than accidentally remounting on every render.
for (const replacement of ["schoolName", "pricingTier"] as const) for (const phase of ["order", "script", "modal"] as const) {
  test(`SubscriptionGate ${replacement} replacement during ${phase} enables controls and suppresses abandoned checkout`, async () => {
    const order = deferred<Response>();
    const scriptReady = deferred<void>();
    const reachedScript = deferred<void>();
    let orders = 0;
    let orderSignal: AbortSignal | null | undefined;
    const f = fixture(async (url: RequestInfo | URL, init?: RequestInit) => {
      if (!String(url).endsWith("/order")) return Response.json({ ok: true });
      orders++;
      if (orders === 1) {
        orderSignal = init?.signal;
        if (phase === "order") return order.promise;
      }
      return orderResponse();
    });
    const Constructor = await f.deps.loadCheckout();
    let scripts = 0;
    f.deps.loadCheckout = async () => {
      if (++scripts === 1 && phase === "script") {
        reachedScript.resolve();
        await scriptReady.promise;
      }
      return Constructor;
    };
    const gate = await gateFixture(f);
    const pending = gate.click();
    if (phase === "script") await reachedScript.promise;
    if (phase === "modal") await pending;
    gate.render();
    gate.controls(true);
    assert.equal(gate.controllers.length, 1, "Same-school state rerenders must preserve controller identity");
    const old = gate.controllers[0];
    const stale = phase === "modal" ? { options: f.options, fail: f.fail } : null;
    if (replacement === "schoolName") gate.render("Replacement School");
    else gate.render("Local QA School", "STARTER");
    assert.ok(gate.options()[0].text.includes(replacement === "schoolName" ? "5,000" : "2,000"), "Replacement must display its assigned tier pricing");
    assert.equal(gate.controllers.length, 2);
    assert.notEqual(old, gate.controllers[1]);
    assert.equal(f.closes, phase === "modal" ? 1 : 0);
    if (phase === "order") assert.equal(orderSignal?.aborted, true);
    gate.controls(false);
    assert.equal(gate.find("alert"), undefined);

    // Start the replacement BEFORE settling old work; stale completion must not
    // release its busy controls, open a modal, show an error or reload the page.
    await gate.click();
    gate.render();
    gate.controls(true);
    const updateCount = gate.updates.length;
    order.resolve(orderResponse());
    scriptReady.resolve();
    await pending;
    if (stale) {
      stale.fail({ error: { description: "Stale failure" } });
      stale.options.modal.ondismiss();
      await stale.options.handler(payment);
    }
    await old.start("YEARLY");
    gate.render();
    gate.controls(true);
    assert.equal(gate.updates.length, updateCount);
    assert.equal(gate.find("alert"), undefined);
    assert.equal(f.opens, phase === "modal" ? 2 : 1);
    assert.equal(f.closes, phase === "modal" ? 1 : 0, "Replacement modal must remain open");
    assert.equal(orders, 2);
    assert.equal(gate.reloads, 0);
    await f.options.handler(payment);
    gate.render();
    gate.controls(false);
    assert.equal(gate.reloads, 1, "Fresh checkout must still verify successfully");
    // Returning to the original name must not resurrect its abandoned busy state.
    gate.render("Local QA School", "PROFESSIONAL");
    gate.controls(false);
    gate.unmount();
  });
}

test("SubscriptionGate effect setup-cleanup-setup creates a fresh active controller (simulated StrictMode)", async () => {
  const f = fixture();
  const gate = await gateFixture(f);
  assert.equal(gate.controllers.length, 1);
  gate.replayEffects();
  assert.equal(gate.controllers.length, 2);
  assert.notEqual(gate.controllers[0], gate.controllers[1]);
  await gate.controllers[0].start("MONTHLY");
  assert.equal(f.opens, 0);
  await gate.click();
  gate.render();
  gate.controls(true);
  assert.equal(f.opens, 1, "Replayed effect must leave a working event-handler controller");
  const stale = f.options;
  const staleClick = gate.find("button")!.props.onClick!;
  gate.unmount();
  const updateCount = gate.updates.length;
  stale.modal.ondismiss();
  await stale.handler(payment);
  await staleClick();
  assert.equal(f.closes, 1);
  assert.equal(f.opens, 1);
  assert.equal(gate.updates.length, updateCount);
  assert.equal(gate.reloads, 0);
});

test("checkout uses the server order and stays busy until verified success", async () => {
  const checkoutApi = await import(helperPath).catch(() => null);
  assert.ok(checkoutApi, "Subscription checkout lifecycle controller is missing");
  const f = fixture();
  const checkout = checkoutApi.createSubscriptionCheckout(f.deps);
  await checkout.start("MONTHLY");
  assert.equal(f.options.order_id, "order_server");
  assert.deepEqual(f.busy, [true]);
  await f.options.handler({ razorpay_order_id: "order_server", razorpay_payment_id: "pay_test", razorpay_signature: "a".repeat(64) });
  assert.equal(f.success, 1);
  assert.deepEqual(f.busy, [true, false]);
  assert.equal(f.requests[1].body.plan, "MONTHLY");
});

test("duplicate clicks cannot open another modal until the current checkout is dismissed", async () => {
  const { createSubscriptionCheckout } = await import(helperPath);
  const f = fixture();
  const checkout = createSubscriptionCheckout(f.deps);
  await Promise.all([checkout.start("MONTHLY"), checkout.start("YEARLY")]);
  assert.equal(f.opens, 1);
  f.options.modal.ondismiss();
  assert.equal(f.cancelled, 1);
  assert.equal(f.success, 0);
  assert.deepEqual(f.busy, [true, false]);
  await checkout.start("YEARLY");
  assert.equal(f.opens, 2);
});

test("duplicate success callbacks and dismiss during verification do not double-submit", async () => {
  const { createSubscriptionCheckout } = await import(helperPath);
  const f = fixture();
  const checkout = createSubscriptionCheckout(f.deps);
  await checkout.start("MONTHLY");
  const response = { razorpay_order_id: "order_server", razorpay_payment_id: "pay_test", razorpay_signature: "a".repeat(64) };
  const first = f.options.handler(response);
  f.options.modal.ondismiss();
  await Promise.all([first, f.options.handler(response)]);
  assert.equal(f.requests.filter(r => r.url.endsWith("/verify")).length, 1);
  assert.equal(f.success, 1);
  assert.equal(f.cancelled, 0);
});

test("order, script and network failures show an error and release the button", async () => {
  const { createSubscriptionCheckout } = await import(helperPath);
  const providers = [
    async () => { throw new Error("Network failed"); },
    async () => new Response("Gateway unavailable", { status: 502 }),
    async () => Response.json({ error: "Provider unavailable" }, { status: 500 }),
    async () => Response.json({ keyId: "public-test-key", order: { id: "order_test", amount: 99, currency: "INR" } }),
  ];
  for (const fetchImpl of providers) {
    const f = fixture(fetchImpl);
    const checkout = createSubscriptionCheckout(f.deps);
    await assert.doesNotReject(() => checkout.start("MONTHLY"));
    assert.equal(f.opens, 0);
    assert.deepEqual(f.busy, [true, false]);
    assert.ok(f.errors.at(-1));
  }
  const f = fixture();
  f.deps.loadCheckout = async () => { throw new Error("Checkout script blocked"); };
  await assert.doesNotReject(() => createSubscriptionCheckout(f.deps).start("MONTHLY"));
  assert.deepEqual(f.busy, [true, false]);
});

test("payment.failed is displayed without opening another modal and dismiss cancels safely", async () => {
  const { createSubscriptionCheckout } = await import(helperPath);
  const f = fixture();
  const checkout = createSubscriptionCheckout(f.deps);
  await checkout.start("MONTHLY");
  f.fail({ error: { description: "Bank declined the test payment" } });
  assert.equal(f.errors.at(-1), "Bank declined the test payment");
  await checkout.start("YEARLY");
  assert.equal(f.opens, 1);
  f.options.modal.ondismiss();
  assert.equal(f.success, 0);
  assert.deepEqual(f.busy, [true, false]);
});

test("failed verification never reloads or treats a payment as paid", async () => {
  const { createSubscriptionCheckout } = await import(helperPath);
  for (const failWithNetwork of [false, true]) {
    const f = fixture(async (url: RequestInfo | URL) => {
      if (String(url).endsWith("/order")) return Response.json({ keyId: "public-test-key", order: { id: "order_server", amount: 500000, currency: "INR" } });
      if (failWithNetwork) throw new Error("Verification network failure");
      return Response.json({ error: "Payment not captured" }, { status: 409 });
    });
    await createSubscriptionCheckout(f.deps).start("MONTHLY");
    await assert.doesNotReject(() => f.options.handler({ razorpay_order_id: "order_server", razorpay_payment_id: "pay_test", razorpay_signature: "a".repeat(64) }));
    assert.equal(f.success, 0);
    assert.ok(f.errors.at(-1));
    assert.deepEqual(f.busy, [true, false]);
  }
});

test("a mismatched checkout order id is rejected before calling verification", async () => {
  const { createSubscriptionCheckout } = await import(helperPath);
  const f = fixture();
  await createSubscriptionCheckout(f.deps).start("MONTHLY");
  await f.options.handler({ razorpay_order_id: "order_other", razorpay_payment_id: "pay_test", razorpay_signature: "a".repeat(64) });
  assert.equal(f.requests.length, 1);
  assert.equal(f.success, 0);
  assert.ok(f.errors.at(-1));
});

test("checkout script loads once for concurrent callers and reuses the loaded constructor", async () => {
  const { createCheckoutScriptLoader } = await import(helperPath);
  assert.equal(typeof createCheckoutScriptLoader, "function");
  const ctor = await fixture().deps.loadCheckout();
  let active: typeof ctor | undefined = undefined;
  let loads = 0;
  let loaded: () => void = () => {};
  const load = createCheckoutScriptLoader({
    getConstructor: () => active,
    attachScript: (onLoad: () => void) => { loads++; loaded = onLoad; return () => {}; },
  });
  const first = load();
  const second = load();
  assert.equal(loads, 1);
  active = ctor;
  loaded();
  assert.deepEqual(await Promise.all([first, second]), [ctor, ctor]);
  assert.equal(await load(), ctor);
  assert.equal(loads, 1);
});

test("blocked checkout script rejects, removes the failed script and allows retry", async () => {
  const { createCheckoutScriptLoader } = await import(helperPath);
  assert.equal(typeof createCheckoutScriptLoader, "function");
  let loads = 0;
  let removals = 0;
  let fail: () => void = () => {};
  const load = createCheckoutScriptLoader({
    getConstructor: () => undefined,
    attachScript: (_onLoad: () => void, onError: () => void) => { loads++; fail = onError; return () => { removals++; }; },
    timeoutMs: 50,
  });
  const first = load();
  fail();
  await assert.rejects(first, /load|blocked/i);
  assert.equal(removals, 1);
  const retry = load();
  await assert.rejects(retry, /load|timeout/i);
  assert.equal(loads, 2);
  assert.equal(removals, 2);
});
