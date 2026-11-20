import { isRenewalPlan } from "./commercial-catalog";

type PaymentAction = "order" | "verify";
type ProxyResult = { status: number; body: Record<string, unknown> };
type ProxyOptions = {
  vendorUrl: string;
  schoolKey: string;
  fetchImpl?: typeof fetch;
  onVerified?: () => void;
};

// Forward only allowed fields. Browser input must never override SCHOOL_API_KEY.
export async function forwardSubscriptionPayment(
  request: Request,
  action: PaymentAction,
  options: ProxyOptions,
): Promise<ProxyResult> {
  let body: Record<string, unknown>;
  try {
    const input: unknown = await request.json();
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return { status: 400, body: { error: "Invalid payment request" } };
    }
    body = input as Record<string, unknown>;
  } catch {
    return { status: 400, body: { error: "Invalid JSON request" } };
  }
  // Retain verification of stored historical quarterly orders, never offer new ones.
  if (!isRenewalPlan(body.plan) && !(action === "verify" && body.plan === "QUARTERLY")) {
    return { status: 400, body: { error: "Choose a valid subscription plan" } };
  }
  if (action === "verify" && ["razorpay_order_id", "razorpay_payment_id", "razorpay_signature"].some(
    field => typeof body[field] !== "string" || !(body[field] as string).trim(),
  )) {
    return { status: 400, body: { error: "Payment verification fields required" } };
  }
  const fields = action === "order"
    ? ["plan"]
    : ["plan", "razorpay_order_id", "razorpay_payment_id", "razorpay_signature"];
  const payload: Record<string, unknown> = {};
  for (const field of fields) payload[field] = body[field];
  payload["apiKey"] = options.schoolKey;
  try {
    const response = await (options.fetchImpl ?? fetch)(
      `${options.vendorUrl.replace(/\/$/, "")}/api/public/pay/${action}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15_000),
        cache: "no-store",
        redirect: "error",
      },
    );
    const result: unknown = await response.json();
    if (!result || typeof result !== "object" || Array.isArray(result)) {
      return { status: 502, body: { error: "Invalid billing server response" } };
    }
    const data = result as Record<string, unknown>;
    if (action === "verify" && response.ok && data.ok === true) options.onVerified?.();
    return { status: response.status, body: data };
  } catch {
    return { status: 502, body: { error: "Billing server unavailable. Please try again." } };
  }
}
