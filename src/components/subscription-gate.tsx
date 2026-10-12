"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const PLAN_LABELS: Record<string, { label: string; price: number }> = {
  MONTHLY: { label: "Monthly", price: 5000 },
  QUARTERLY: { label: "Quarterly", price: 14250 },
  HALF_YEARLY: { label: "Half-Yearly", price: 27000 },
  YEARLY: { label: "Yearly", price: 51000 },
};

export default function SubscriptionGate({ schoolName }: { schoolName: string }) {
  const [plan, setPlan] = useState("MONTHLY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function payNow() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/subscription/pay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Payment order fail hua");
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const rzp = new window.Razorpay({
          key: data.keyId,
          amount: data.order.amount,
          currency: data.order.currency,
          order_id: data.order.id,
          name: "School ERP Subscription Renewal",
          description: `${schoolName} -- ${PLAN_LABELS[plan].label} Plan`,
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            const vr = await fetch("/api/subscription/pay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ plan, ...response }),
            });
            if (vr.ok) {
              window.location.reload();
            } else {
              setError("Payment verify nahi ho paya -- support se contact karo.");
            }
          },
        });
        rzp.open();
      };
      document.body.appendChild(script);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-lg font-semibold text-slate-900 mb-1">Subscription Expired</h1>
        <p className="text-sm text-slate-500 mb-6">
          {schoolName}'s subscription has ended. Renew now to unlock the ERP instantly -- all your data is safe
          and untouched.
        </p>

        {error && <p className="text-rose-600 text-sm mb-3">{error}</p>}

        <div className="text-left mb-5">
          <label className="block text-xs font-medium text-slate-600 mb-1">Choose a plan</label>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {Object.entries(PLAN_LABELS).map(([key, p]) => (
              <option key={key} value={key}>
                {p.label} -- Rs {p.price.toLocaleString("en-IN")}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={payNow}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm"
        >
          {loading ? "Opening payment..." : "Pay Now & Unlock"}
        </button>
        <p className="text-xs text-slate-400 mt-4">
          Payment goes through instantly -- no waiting, no manual approval needed.
        </p>
      </div>
    </div>
  );
}
