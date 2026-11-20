"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";
import { Badge, statusTone } from "@/components/ui/badge";
import { Printer } from "lucide-react";

type Tab = "trial-balance" | "profit-loss" | "balance-sheet" | "receivables-ageing" | "payables-ageing" | "compile";

const TABS: { id: Tab; label: string }[] = [
  { id: "trial-balance", label: "Trial Balance" },
  { id: "profit-loss", label: "Profit & Loss" },
  { id: "balance-sheet", label: "Balance Sheet" },
  { id: "receivables-ageing", label: "Receivables Ageing" },
  { id: "payables-ageing", label: "Payables Ageing" },
  { id: "compile", label: "Account Compile Report" },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}
function monthStart() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>("trial-balance");
  const [asOf, setAsOf] = useState(today());
  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(today());

  const [trialBalance, setTrialBalance] = useState<any>(null);
  const [pnl, setPnl] = useState<any>(null);
  const [balanceSheet, setBalanceSheet] = useState<any>(null);
  const [receivables, setReceivables] = useState<any>(null);
  const [payables, setPayables] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/reports/trial-balance?asOf=${asOf}`).then((r) => r.json()).then(setTrialBalance);
  }, [asOf]);
  useEffect(() => {
    fetch(`/api/reports/profit-loss?from=${from}&to=${to}`).then((r) => r.json()).then(setPnl);
  }, [from, to]);
  useEffect(() => {
    fetch(`/api/reports/balance-sheet?asOf=${asOf}`).then((r) => r.json()).then(setBalanceSheet);
  }, [asOf]);
  useEffect(() => {
    fetch(`/api/reports/receivables-ageing`).then((r) => r.json()).then(setReceivables);
  }, []);
  useEffect(() => {
    fetch(`/api/reports/payables-ageing`).then((r) => r.json()).then(setPayables);
  }, []);

  return (
    <div>
      <div className="print:hidden flex items-center justify-between">
        <PageHeader title="Financial Reports" description="Trial Balance, P&L, Balance Sheet, Ageing -- sab isi se" />
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer className="w-4 h-4" />
          Print
        </Button>
      </div>

      <div className="print:hidden flex gap-2 mb-4 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              tab === t.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {(tab === "trial-balance" || tab === "balance-sheet" || tab === "compile") && (
        <div className="print:hidden mb-4 flex items-center gap-2">
          <label className="text-sm text-slate-500">As of</label>
          <input
            type="date"
            value={asOf}
            onChange={(e) => setAsOf(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
      )}
      {(tab === "profit-loss" || tab === "compile") && (
        <div className="print:hidden mb-4 flex items-center gap-2">
          <label className="text-sm text-slate-500">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm" />
          <label className="text-sm text-slate-500">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm" />
        </div>
      )}

      {(tab === "trial-balance" || tab === "compile") && trialBalance && (
        <Card className="mb-6">
          <CardBody>
            <h2 className="font-semibold text-slate-800 mb-3">Trial Balance (as of {asOf})</h2>
            <Table>
              <Thead>
                <tr>
                  <Th>Account</Th>
                  <Th>Debit</Th>
                  <Th>Credit</Th>
                </tr>
              </Thead>
              <tbody>
                {trialBalance.rows.map((r: any) => (
                  <Tr key={r.id}>
                    <Td>
                      {r.code} - {r.name}
                    </Td>
                    <Td>{r.debitBalance > 0 ? r.debitBalance.toFixed(2) : ""}</Td>
                    <Td>{r.creditBalance > 0 ? r.creditBalance.toFixed(2) : ""}</Td>
                  </Tr>
                ))}
                {trialBalance.rows.length === 0 && <EmptyRow colSpan={3}>Koi balance nahi hai</EmptyRow>}
                <Tr className="bg-slate-50">
                  <Td className="font-semibold">Total</Td>
                  <Td className="font-semibold">{trialBalance.totalDebit.toFixed(2)}</Td>
                  <Td className="font-semibold">{trialBalance.totalCredit.toFixed(2)}</Td>
                </Tr>
              </tbody>
            </Table>
            <p className={`text-sm mt-2 ${Math.abs(trialBalance.totalDebit - trialBalance.totalCredit) < 0.01 ? "text-emerald-600" : "text-rose-600"}`}>
              {Math.abs(trialBalance.totalDebit - trialBalance.totalCredit) < 0.01 ? "Balanced" : "Not balanced -- check entries"}
            </p>
          </CardBody>
        </Card>
      )}

      {(tab === "profit-loss" || tab === "compile") && pnl && (
        <Card className="mb-6">
          <CardBody>
            <h2 className="font-semibold text-slate-800 mb-3">
              Profit &amp; Loss ({from} to {to})
            </h2>
            <p className="text-sm font-medium text-slate-500 mb-1">Income</p>
            <Table>
              <tbody>
                {pnl.income.map((r: any) => (
                  <Tr key={r.id}>
                    <Td>{r.name}</Td>
                    <Td className="text-right">{r.amount.toFixed(2)}</Td>
                  </Tr>
                ))}
                {pnl.income.length === 0 && <EmptyRow colSpan={2}>Koi income nahi hai</EmptyRow>}
                <Tr className="bg-slate-50">
                  <Td className="font-semibold">Total Income</Td>
                  <Td className="font-semibold text-right">{pnl.totalIncome.toFixed(2)}</Td>
                </Tr>
              </tbody>
            </Table>
            <p className="text-sm font-medium text-slate-500 mt-4 mb-1">Expenses</p>
            <Table>
              <tbody>
                {pnl.expense.map((r: any) => (
                  <Tr key={r.id}>
                    <Td>{r.name}</Td>
                    <Td className="text-right">{r.amount.toFixed(2)}</Td>
                  </Tr>
                ))}
                {pnl.expense.length === 0 && <EmptyRow colSpan={2}>Koi expense nahi hai</EmptyRow>}
                <Tr className="bg-slate-50">
                  <Td className="font-semibold">Total Expense</Td>
                  <Td className="font-semibold text-right">{pnl.totalExpense.toFixed(2)}</Td>
                </Tr>
              </tbody>
            </Table>
            <p className={`text-lg font-bold mt-4 ${pnl.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              Net {pnl.netProfit >= 0 ? "Profit" : "Loss"}: {Math.abs(pnl.netProfit).toFixed(2)}
            </p>
          </CardBody>
        </Card>
      )}

      {(tab === "balance-sheet" || tab === "compile") && balanceSheet && (
        <Card className="mb-6">
          <CardBody>
            <h2 className="font-semibold text-slate-800 mb-3">Balance Sheet (as of {asOf})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Assets</p>
                <Table>
                  <tbody>
                    {balanceSheet.assets.map((r: any) => (
                      <Tr key={r.id}>
                        <Td>{r.name}</Td>
                        <Td className="text-right">{r.amount.toFixed(2)}</Td>
                      </Tr>
                    ))}
                    <Tr className="bg-slate-50">
                      <Td className="font-semibold">Total Assets</Td>
                      <Td className="font-semibold text-right">{balanceSheet.totalAssets.toFixed(2)}</Td>
                    </Tr>
                  </tbody>
                </Table>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Liabilities</p>
                <Table>
                  <tbody>
                    {balanceSheet.liabilities.map((r: any) => (
                      <Tr key={r.id}>
                        <Td>{r.name}</Td>
                        <Td className="text-right">{r.amount.toFixed(2)}</Td>
                      </Tr>
                    ))}
                    <Tr className="bg-slate-50">
                      <Td className="font-semibold">Total Liabilities</Td>
                      <Td className="font-semibold text-right">{balanceSheet.totalLiabilities.toFixed(2)}</Td>
                    </Tr>
                  </tbody>
                </Table>
                <p className="text-sm font-medium text-slate-500 mt-4 mb-1">Equity</p>
                <Table>
                  <tbody>
                    {balanceSheet.equity.map((r: any) => (
                      <Tr key={r.id}>
                        <Td>{r.name}</Td>
                        <Td className="text-right">{r.amount.toFixed(2)}</Td>
                      </Tr>
                    ))}
                    <Tr>
                      <Td>Retained Profit (to date)</Td>
                      <Td className="text-right">{balanceSheet.netProfit.toFixed(2)}</Td>
                    </Tr>
                    <Tr className="bg-slate-50">
                      <Td className="font-semibold">Total Equity</Td>
                      <Td className="font-semibold text-right">{balanceSheet.totalEquity.toFixed(2)}</Td>
                    </Tr>
                  </tbody>
                </Table>
              </div>
            </div>
            <p className={`text-sm mt-3 ${balanceSheet.balanced ? "text-emerald-600" : "text-rose-600"}`}>
              {balanceSheet.balanced ? "Balanced: Assets = Liabilities + Equity" : "Not balanced -- check entries"}
            </p>
          </CardBody>
        </Card>
      )}

      {(tab === "receivables-ageing" || tab === "compile") && receivables && (
        <Card className="mb-6">
          <CardBody>
            <h2 className="font-semibold text-slate-800 mb-3">Student Receivables Ageing</h2>
            <div className="flex gap-2 mb-3 flex-wrap">
              {receivables.summary.map((s: any) => (
                <Badge key={s.bucket} tone={s.bucket === "Not Due" ? "slate" : s.bucket === "90+" ? "red" : "yellow"}>
                  {s.bucket}: {s.total.toFixed(0)} ({s.count})
                </Badge>
              ))}
            </div>
            <Table>
              <Thead>
                <tr>
                  <Th>Student</Th>
                  <Th>Invoice</Th>
                  <Th>Due Date</Th>
                  <Th>Outstanding</Th>
                  <Th>Bucket</Th>
                </tr>
              </Thead>
              <tbody>
                {receivables.rows.map((r: any) => (
                  <Tr key={r.id}>
                    <Td>
                      {r.studentName}
                      <span className="block text-xs text-slate-400">{r.admissionNo}</span>
                    </Td>
                    <Td>{r.title}</Td>
                    <Td>{new Date(r.dueDate).toLocaleDateString()}</Td>
                    <Td>{r.outstanding.toFixed(2)}</Td>
                    <Td>
                      <Badge tone={statusTone(r.bucket === "90+" ? "OVERDUE" : r.bucket === "Not Due" ? "ACTIVE" : "PENDING")}>
                        {r.bucket}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
                {receivables.rows.length === 0 && <EmptyRow colSpan={5}>Koi outstanding invoice nahi hai</EmptyRow>}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      {(tab === "payables-ageing" || tab === "compile") && payables && (
        <Card className="mb-6">
          <CardBody>
            <h2 className="font-semibold text-slate-800 mb-3">Vendor Payables Ageing</h2>
            <div className="flex gap-2 mb-3 flex-wrap">
              {payables.summary.map((s: any) => (
                <Badge key={s.bucket} tone={s.bucket === "Not Due" ? "slate" : s.bucket === "90+" ? "red" : "yellow"}>
                  {s.bucket}: {s.total.toFixed(0)} ({s.count})
                </Badge>
              ))}
            </div>
            <Table>
              <Thead>
                <tr>
                  <Th>Vendor</Th>
                  <Th>Description</Th>
                  <Th>Due Date</Th>
                  <Th>Outstanding</Th>
                  <Th>Bucket</Th>
                </tr>
              </Thead>
              <tbody>
                {payables.rows.map((r: any) => (
                  <Tr key={r.id}>
                    <Td>{r.vendorName}</Td>
                    <Td>{r.description}</Td>
                    <Td>{new Date(r.dueDate).toLocaleDateString()}</Td>
                    <Td>{r.outstanding.toFixed(2)}</Td>
                    <Td>
                      <Badge tone={statusTone(r.bucket === "90+" ? "OVERDUE" : r.bucket === "Not Due" ? "ACTIVE" : "PENDING")}>
                        {r.bucket}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
                {payables.rows.length === 0 && <EmptyRow colSpan={5}>Koi outstanding bill nahi hai</EmptyRow>}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
