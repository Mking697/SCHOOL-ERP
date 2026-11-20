"use client";

import { useEffect, useRef, useState } from "react";
import { createSubscriptionCheckout, loadRazorpayCheckout } from "@/lib/subscription-checkout";
import { ShieldAlert } from "lucide-react";
import { isSchoolTier, plansForTier, SCHOOL_TIERS, type SchoolTier } from "@/lib/commercial-catalog";

export default function SubscriptionGate({ schoolName, pricingTier }: { schoolName: string; pricingTier?: unknown }) {
  const tier = isSchoolTier(pricingTier) ? pricingTier : "PROFESSIONAL";
  // School or billing-tier replacement disposes old checkout and resets busy UI.
  return <SchoolSubscriptionGate key={`${schoolName}:${tier}`} schoolName={schoolName} pricingTier={tier} />;
}

function SchoolSubscriptionGate({ schoolName, pricingTier }: { schoolName: string; pricingTier: SchoolTier }) {
  const plans = plansForTier(pricingTier);
  const tier = SCHOOL_TIERS.find(item => item.id === pricingTier)!;
  const [plan, setPlan] = useState("MONTHLY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkoutRef = useRef<ReturnType<typeof createSubscriptionCheckout> | null>(null);
  useEffect(() => {
    const checkout = createSubscriptionCheckout({
      schoolName,
      loadCheckout: loadRazorpayCheckout,
      onBusyChange: setLoading,
      onError: setError,
      onCancelled: () => setError("Payment cancelled. Subscription mein koi change nahi hua."),
      onVerified: () => window.location.reload(),
    });
    checkoutRef.current = checkout;
    return () => {
      checkoutRef.current = null;
      checkout.dispose();
    };
  }, [schoolName]);

  async function payNow() {
    await checkoutRef.current?.start(plan);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-lg font-semibold text-slate-900 mb-1">Subscription Expired</h1>
        <p className="text-sm text-slate-500 mb-6">
          {schoolName}&apos;s subscription has ended. Renew now to unlock the ERP instantly -- all your data is safe
          and untouched.
        </p>

        {error && <p role="alert" className="text-rose-600 text-sm mb-3">{error}</p>}

        <div className="text-left mb-5">
          <p className="text-sm text-slate-600 mb-3">{tier.label} pricing · assigned by your billing administrator</p>
          <label htmlFor="subscription-plan" className="block text-xs font-medium text-slate-600 mb-1">Choose a plan</label>
          <select
            id="subscription-plan"
            disabled={loading}
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {plans.map(p => (
              <option key={p.id} value={p.id}>
                {p.label} -- Rs {p.priceInr.toLocaleString("en-IN")}{p.discountPct > 0 ? ` (save ${p.discountPct}%)` : ""}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={payNow}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm"
        >
          {loading ? "Opening payment..." : "Pay Now & Unlock"}
        </button>
        <p className="text-xs text-slate-400 mt-4">
          Subscription renews after the payment is captured and verified securely.
        </p>
      </div>
    </div>
  );
}
