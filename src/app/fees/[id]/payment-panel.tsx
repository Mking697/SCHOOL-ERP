"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function PaymentPanel({
  invoiceId,
  balance,
  status,
}: {
  invoiceId: string;
  balance: number;
  status: string;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(balance.toFixed(2));
  const [method, setMethod] = useState("CASH");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "PAID") {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center text-green-700 print:hidden">
        Invoice fully paid.
        <button
          onClick={() => window.print()}
          className="block mx-auto mt-2 bg-gray-700 text-white rounded px-4 py-2 text-sm"
        >
          Print Receipt
        </button>
      </div>
    );
  }

  async function recordCashPayment(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), method }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error);
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function payOnline() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/payments/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, amount: Number(amount) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
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
          name: "School Fee Payment",
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ invoiceId, amount: Number(amount), ...response }),
            });
            router.refresh();
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
    <div className="bg-white rounded-lg shadow p-4 print:hidden">
      <h2 className="font-semibold mb-3">Record Payment</h2>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <form onSubmit={recordCashPayment} className="flex gap-2 items-end flex-wrap">
        <div>
          <label className="block text-xs mb-1">Amount</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-32"
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CHEQUE">Cheque</option>
          </select>
        </div>
        <button
          disabled={loading}
          className="bg-green-600 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
        >
          Record Payment
        </button>
        <button
          type="button"
          onClick={payOnline}
          disabled={loading}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
        >
          Pay Online (Razorpay)
        </button>
      </form>
    </div>
  );
}
