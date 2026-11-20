import assert from "node:assert/strict";
import test from "node:test";

const helperPath = "../src/lib/subscription-payment-proxy.ts";

test("browser cannot replace the school's server-side billing credential", async () => {
  const proxyApi = await import(helperPath).catch(() => null);
  assert.ok(proxyApi, "Subscription payment proxy validation helper is missing");
  let forwarded: Record<string, unknown> | null = null;
  const result = await proxyApi.forwardSubscriptionPayment(
    new Request("http://school.local/api/subscription/pay/order", {
      method: "POST",
      body: JSON.stringify({ plan: "MONTHLY", apiKey: "attacker-school", amount: 1, pricingTier: "STARTER", tier: "STARTER", priceInr: 1 }),
    }),
    "order",
    {
      vendorUrl: "https://billing.example.test",
      schoolKey: "server-school",
      fetchImpl: async (_url: string, init: RequestInit) => {
        forwarded = JSON.parse(String(init.body));
        return Response.json({ order: { id: "order_test", amount: 500000, currency: "INR" } });
      },
    },
  );
  assert.equal(result.status, 200);
  assert.deepEqual(forwarded, { plan: "MONTHLY", apiKey: "server-school" });
});

test("invalid JSON, invalid plan and missing payment fields are rejected before forwarding", async () => {
  const { forwardSubscriptionPayment } = await import(helperPath);
  const cases: ["order" | "verify", string][] = [
    ["order", "{"], ["order", "null"],
    ["order", JSON.stringify({ plan: "FREE" })],
    ["verify", JSON.stringify({ plan: "MONTHLY" })],
  ];
  for (const [action, body] of cases) {
    let calls = 0;
    const result = await forwardSubscriptionPayment(
      new Request("http://school.local/api", { method: "POST", body }), action,
      { vendorUrl: "https://billing.example.test", schoolKey: "server-school", fetchImpl: async () => { calls++; return Response.json({ ok: true }); } },
    );
    assert.equal(result.status, 400);
    assert.equal(calls, 0);
  }
});

test("new orders accept only three billing cycles while historical quarterly verification remains valid", async () => {
  const { forwardSubscriptionPayment } = await import(helperPath);
  const forwarded: Record<string, unknown>[] = [];
  const options = {
    vendorUrl: "https://billing.example.test", schoolKey: "server-school",
    fetchImpl: async (_url: RequestInfo | URL, init?: RequestInit) => {
      forwarded.push(JSON.parse(String(init?.body)));
      return Response.json({ ok: true });
    },
  };
  const request = (plan: string) => new Request("http://school.local/api", { method: "POST", body: JSON.stringify({
    plan, pricingTier: "STARTER", amount: 1,
    razorpay_order_id: "order_old", razorpay_payment_id: "pay_old", razorpay_signature: "a".repeat(64),
  }) });
  assert.equal((await forwardSubscriptionPayment(request("QUARTERLY"), "order", options)).status, 400);
  assert.equal(forwarded.length, 0);
  for (const plan of ["MONTHLY", "HALF_YEARLY", "YEARLY"]) {
    assert.equal((await forwardSubscriptionPayment(request(plan), "order", options)).status, 200);
    assert.deepEqual(forwarded.at(-1), { plan, apiKey: "server-school" });
  }
  assert.equal((await forwardSubscriptionPayment(request("QUARTERLY"), "verify", options)).status, 200);
  assert.deepEqual(forwarded.at(-1), {
    plan: "QUARTERLY", apiKey: "server-school", razorpay_order_id: "order_old", razorpay_payment_id: "pay_old", razorpay_signature: "a".repeat(64),
  });
});

test("vendor network and non-JSON failures return a safe gateway error with a timeout", async () => {
  const { forwardSubscriptionPayment } = await import(helperPath);
  let receivedSignal: unknown;
  const providers = [
    async (_url: string, init: RequestInit) => {
      receivedSignal = init.signal;
      throw new Error("sensitive upstream context");
    },
    async () => new Response("<html>Service down</html>", { status: 502 }),
  ];
  for (const fetchImpl of providers) {
    const result = await forwardSubscriptionPayment(
      new Request("http://school.local/api", { method: "POST", body: JSON.stringify({ plan: "MONTHLY" }) }),
      "order", { vendorUrl: "https://billing.example.test", schoolKey: "server-school", fetchImpl },
    );
    assert.equal(result.status, 502);
    assert.equal(JSON.stringify(result.body).includes("sensitive upstream"), false);
  }
  assert.ok(receivedSignal instanceof AbortSignal);
});

test("only verified payment success invalidates the same-process subscription cache", async () => {
  const { forwardSubscriptionPayment } = await import(helperPath);
  let invalidations = 0;
  const body = { plan: "MONTHLY", razorpay_order_id: "order_test", razorpay_payment_id: "pay_test", razorpay_signature: "a".repeat(64) };
  for (const [status, ok] of [[400, false], [200, false], [200, true]] as const) {
    const result = await forwardSubscriptionPayment(
      new Request("http://school.local/api", { method: "POST", body: JSON.stringify(body) }), "verify",
      { vendorUrl: "https://billing.example.test", schoolKey: "server-school", onVerified: () => { invalidations++; }, fetchImpl: async () => Response.json({ ok }, { status }) },
    );
    assert.equal(result.status, status);
  }
  assert.equal(invalidations, 1);
});
