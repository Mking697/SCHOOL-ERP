"use client";

import { useEffect, useRef, useState } from "react";
import { AlarmClock } from "lucide-react";
import { createSubscriptionCheckout, loadRazorpayCheckout } from "@/lib/subscription-checkout";
import { plansForTier, type SchoolTier } from "@/lib/commercial-catalog";

export function RenewalBanner({
  schoolName,
  daysLeft,
  currentPeriodEnd,
  pricingTier,
}: {
  schoolName: string;
  daysLeft: number;
  currentPeriodEnd: string;
  pricingTier: SchoolTier;
}) {
  const plans = plansForTier(pricingTier);
  const [plan, setPlan] = useState("MONTHLY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const checkoutRef = useRef<ReturnType<typeof createSubscriptionCheckout> | null>(null);
  useEffect(() => {
    const checkout = createSubscriptionCheckout({
      schoolName,
      loadCheckout: loadRazorpayCheckout,
      onBusyChange: setLoading,
      onError: setError,
      onCancelled: () => setError("Payment cancel ho gaya. Subscription abhi tak renew nahi hui."),
      onVerified: () => {
        setDone(true);
        window.location.reload();
      },
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

  if (done) return null;

  const urgent = daysLeft <= 1;

  return (
    <div
      className={`print:hidden flex flex-wrap items-center gap-3 px-4 lg:px-6 py-2.5 text-sm border-b ${
        urgent ? "bg-rose-50 border-rose-200 text-rose-900" : "bg-amber-50 border-amber-200 text-amber-900"
      }`}
    >
      <AlarmClock className="w-4 h-4 shrink-0" />
      <p className="font-medium">
        {daysLeft <= 0
          ? "Aapki subscription aaj khatam ho rahi hai!"
          : `Aapki subscription ${daysLeft} din me khatam ho rahi hai`}{" "}
        <span className="font-normal opacity-80">
          ({new Date(currentPeriodEnd).toLocaleDateString("en-IN")}) -- abhi renew karein taaki ERP band na ho.
        </span>
      </p>
      <div className="flex items-center gap-2 ml-auto">
        {error && <p role="alert" className="text-xs max-w-xs">{error}</p>}
        <select
          disabled={loading}
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="border border-current/30 bg-white rounded-lg px-2 py-1.5 text-xs"
        >
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label} -- Rs {p.priceInr.toLocaleString("en-IN")}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={payNow}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg px-3 py-1.5 text-xs whitespace-nowrap"
        >
          {loading ? "Opening..." : "Renew Now"}
        </button>
      </div>
    </div>
  );
}
