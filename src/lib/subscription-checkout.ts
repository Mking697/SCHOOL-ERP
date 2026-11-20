type PaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};
type CheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: PaymentResponse) => Promise<void>;
  modal?: { ondismiss: () => void };
};
type CheckoutInstance = {
  open: () => void;
  close?: () => void;
  on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
};
export type CheckoutConstructor = new (options: CheckoutOptions) => CheckoutInstance;
type ScriptEnvironment = {
  getConstructor: () => CheckoutConstructor | undefined;
  attachScript: (onLoad: () => void, onError: () => void) => () => void;
  timeoutMs?: number;
};

export function createCheckoutScriptLoader(environment: ScriptEnvironment) {
  let pending: Promise<CheckoutConstructor> | null = null;
  return function load(): Promise<CheckoutConstructor> {
    const ready = environment.getConstructor();
    if (ready) return Promise.resolve(ready);
    if (pending) return pending;
    pending = new Promise<CheckoutConstructor>((resolve, reject) => {
      let remove = () => {};
      const fail = () => {
        clearTimeout(timer);
        remove();
        reject(new Error("Razorpay checkout script load failed or timed out. Check your connection/ad blocker."));
      };
      const timer = setTimeout(fail, environment.timeoutMs ?? 15_000);
      remove = environment.attachScript(() => {
        const Constructor = environment.getConstructor();
        if (!Constructor) { fail(); return; }
        clearTimeout(timer);
        resolve(Constructor);
      }, fail);
    }).catch(error => {
      pending = null;
      throw error;
    });
    return pending;
  };
}

export const loadRazorpayCheckout = createCheckoutScriptLoader({
  getConstructor: () => (window as unknown as { Razorpay?: CheckoutConstructor }).Razorpay,
  attachScript: (onLoad, onError) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
    document.body.appendChild(script);
    return () => script.remove();
  },
});
type CheckoutDependencies = {
  schoolName: string;
  loadCheckout: () => Promise<CheckoutConstructor>;
  fetchImpl?: typeof fetch;
  onBusyChange: (busy: boolean) => void;
  onError: (message: string | null) => void;
  onCancelled: () => void;
  onVerified: () => void;
};

export function createSubscriptionCheckout(deps: CheckoutDependencies) {
  const request = deps.fetchImpl ?? fetch;
  let busy = false;
  let disposed = false;
  let orderRequest: AbortController | null = null;
  let activeCheckout: CheckoutInstance | null = null;
  function dispose() {
    if (disposed) return;
    disposed = true;
    orderRequest?.abort();
    orderRequest = null;
    const checkout = activeCheckout;
    activeCheckout = null;
    checkout?.close?.();
  }
  async function start(plan: string) {
    if (disposed || busy) return;
    busy = true;
    let phase: "checkout" | "verifying" | "settled" = "checkout";
    const finish = () => {
      phase = "settled";
      busy = false;
      activeCheckout = null;
      if (!disposed) deps.onBusyChange(false);
    };
    const readResponse = async (response: Response): Promise<Record<string, unknown>> => {
      const body: unknown = await response.json();
      if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid billing response");
      return body as Record<string, unknown>;
    };
    const message = (body: Record<string, unknown>, fallback: string) =>
      typeof body.error === "string" ? body.error.slice(0, 400) : fallback;
    deps.onBusyChange(true);
    deps.onError(null);
    try {
      orderRequest = new AbortController();
      const result = await request("/api/subscription/pay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
        signal: AbortSignal.any([orderRequest.signal, AbortSignal.timeout(15_000)]),
      });
      if (disposed) return;
      const data = await readResponse(result);
      orderRequest = null;
      if (disposed) return;
      if (!result.ok) throw new Error(message(data, "Payment order fail hua"));
      const order = data.order as { id?: unknown; amount?: unknown; currency?: unknown } | undefined;
      if (!order || typeof order.id !== "string" || !order.id || typeof data.keyId !== "string" || !data.keyId ||
          typeof order.amount !== "number" || !Number.isSafeInteger(order.amount) || order.amount < 100 || order.currency !== "INR") {
        throw new Error("Invalid payment order received. Please contact support.");
      }
      const orderId = order.id;
      const Checkout = await deps.loadCheckout();
      if (disposed) return;
      const checkout = new Checkout({
        key: data.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: orderId,
        name: "School ERP Subscription Renewal",
        description: `${deps.schoolName} -- ${plan} Plan`,
        modal: { ondismiss: () => {
          if (disposed || phase !== "checkout") return;
          finish();
          deps.onCancelled();
        } },
        handler: async (response) => {
          if (disposed || phase !== "checkout") return;
          phase = "verifying";
          try {
            if (response.razorpay_order_id !== orderId || !response.razorpay_payment_id ||
                typeof response.razorpay_signature !== "string" || !/^[a-f0-9]{64}$/i.test(response.razorpay_signature)) {
              throw new Error("Invalid checkout response. Please contact support.");
            }
            const verified = await request("/api/subscription/pay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                plan,
                razorpay_order_id: orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
              signal: AbortSignal.timeout(15_000),
            });
            const verification = await readResponse(verified);
            if (!verified.ok || verification.ok !== true) {
              throw new Error(message(verification, "Payment verify nahi ho paya"));
            }
            if (!disposed) deps.onVerified();
          } catch {
            if (!disposed) deps.onError("Payment verify nahi ho paya. Agar amount debit hua hai, dobara pay na karein; support se contact karein.");
          } finally {
            finish();
          }
        },
      });
      checkout.on("payment.failed", response => {
        if (disposed || phase !== "checkout") return;
        deps.onError(response.error?.description?.slice(0, 400) || "Payment failed. You can retry inside checkout or close it.");
      });
      activeCheckout = checkout;
      checkout.open();
    } catch (error) {
      orderRequest = null;
      if (disposed) return;
      deps.onError(error instanceof Error ? error.message : "Payment checkout open nahi ho paya. Please try again.");
      finish();
    }
  }
  return { start, dispose };
}
