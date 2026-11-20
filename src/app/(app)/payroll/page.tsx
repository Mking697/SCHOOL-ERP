"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Staff = { id: string; name: string; designation: string; salary: string | null };
type Payslip = { id: string; staffId: string; month: string; amount: string; status: string };

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function PayrollPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);

  function load() {
    fetch("/api/payroll/roster").then((r) => r.json()).then(setStaff).catch(() => {});
    fetch("/api/payslips").then((r) => r.json()).then(setPayslips).catch(() => {});
  }
  useEffect(load, []);

  async function generate(staffId: string) {
    await fetch("/api/payslips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffId, month: currentMonth() }),
    });
    load();
  }

  async function markPaid(id: string) {
    await fetch(`/api/payslips/${id}/pay`, { method: "POST" });
    load();
  }

  function slipFor(staffId: string) {
    return payslips.find((p) => p.staffId === staffId && p.month === currentMonth());
  }

  return (
    <div>
      <PageHeader title="Payroll" description={`Generate and track ${currentMonth()} salary payslips`} />
      <Card>
        <div className="divide-y divide-slate-100">
          {staff.map((s) => {
            const slip = slipFor(s.id);
            return (
              <div key={s.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{s.name}</p>
                  <p className="text-xs text-slate-400">
                    {s.designation} &middot; Salary: {s.salary ? `Rs ${Number(s.salary).toFixed(0)}` : "not set"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {slip ? (
                    <>
                      <Badge tone={slip.status === "PAID" ? "green" : "yellow"}>{slip.status}</Badge>
                      {slip.status !== "PAID" && (
                        <Button variant="success" size="sm" onClick={() => markPaid(slip.id)}>
                          Mark Paid
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => generate(s.id)} disabled={!s.salary}>
                      Generate Payslip
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {staff.length === 0 && <p className="text-sm text-slate-400 p-4">Koi staff nahi mila</p>}
        </div>
      </Card>
    </div>
  );
}
