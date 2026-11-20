"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet } from "lucide-react";

type Payslip = {
  id: string;
  month: string;
  amount: string;
  status: string;
  paidOn: string | null;
};

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function PayrollPanel({ staffId, canManage }: { staffId: string; canManage: boolean }) {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(false);

  function load() {
    fetch(`/api/payslips?staffId=${staffId}`).then((r) => r.json()).then(setPayslips).catch(() => {});
  }

  useEffect(load, [staffId]);

  async function generate() {
    setLoading(true);
    try {
      await fetch("/api/payslips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId, month: currentMonth() }),
      });
      load();
    } finally {
      setLoading(false);
    }
  }

  async function markPaid(id: string) {
    await fetch(`/api/payslips/${id}/pay`, { method: "POST" });
    load();
  }

  if (!canManage && payslips.length === 0) return null;

  return (
    <Card className="max-w-2xl mt-4">
      <CardHeader>
        <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <Wallet className="w-4 h-4 text-indigo-500" />
          Payroll
        </p>
        {canManage && (
          <Button variant="secondary" size="sm" onClick={generate} disabled={loading}>
            Generate {currentMonth()} Payslip
          </Button>
        )}
      </CardHeader>
      <CardBody>
        {payslips.length === 0 ? (
          <p className="text-sm text-slate-400">Koi payslip abhi nahi bana</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {payslips.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 text-sm">
                <span>{p.month}</span>
                <span className="text-slate-600">Rs {Number(p.amount).toFixed(0)}</span>
                <Badge tone={p.status === "PAID" ? "green" : "yellow"}>{p.status}</Badge>
                {canManage && p.status !== "PAID" && (
                  <Button variant="success" size="sm" onClick={() => markPaid(p.id)}>
                    Mark Paid
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
