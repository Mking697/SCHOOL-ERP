"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { CheckCircle2, Printer } from "lucide-react";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function PaymentPanel({
  invoiceId,
  balance,
  status,
  isPortal = false,
}: {
  invoiceId: string;
  balance: number;
  status: string;
  isPortal?: boolean;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(balance.toFixed(2));
  const [method, setMethod] = useState("CASH");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "PAID") {
    return (
      <Card className="print:hidden">
        <CardBody className="text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-emerald-700 font-medium">Invoice fully paid</p>
          <Button variant="secondary" size="sm" onClick={() => window.print()} className="mt-3">
            <Printer className="w-3.5 h-3.5" />
            Print Receipt
          </Button>
        </CardBody>
      </Card>
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
    <Card className="print:hidden">
      <CardHeader>
        <p className="text-sm font-semibold text-slate-800">
          {isPortal ? "Pay Fees" : "Record Payment"}
        </p>
      </CardHeader>
      <CardBody>
        {error && <p className="text-rose-600 text-sm mb-3">{error}</p>}
        {isPortal ? (
          <div className="flex gap-3 items-end flex-wrap">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-32"
              />
            </div>
            <Button type="button" variant="primary" onClick={payOnline} disabled={loading}>
              Pay Online (Razorpay)
            </Button>
          </div>
        ) : (
          <form onSubmit={recordCashPayment} className="flex gap-3 items-end flex-wrap">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-32"
              />
            </div>
            <div>
              <Label>Method</Label>
              <Select value={method} onChange={(e) => setMethod(e.target.value)} className="w-40">
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
              </Select>
            </div>
            <Button type="submit" variant="success" disabled={loading}>
              Record Payment
            </Button>
            <Button type="button" variant="primary" onClick={payOnline} disabled={loading}>
              Pay Online (Razorpay)
            </Button>
          </form>
        )}
      </CardBody>
    </Card>
  );
}
