"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import Link from "next/link";

type Account = { id: string; code: string; name: string; type: string };
type Line = { debit: string; credit: string; account: Account };
type Entry = { id: string; date: string; narration: string; lines: Line[] };

export default function ExpensesPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    expenseAccountId: "",
    paidFromAccountId: "",
    amount: "",
    narration: "",
  });

  async function load() {
    const [a, e] = await Promise.all([fetch("/api/accounts"), fetch("/api/expenses")]);
    setAccounts(await a.json());
    setEntries(await e.json());
  }

  useEffect(() => {
    load();
  }, []);

  const expenseAccounts = accounts.filter((a) => a.type === "EXPENSE");
  const cashBankAccounts = accounts.filter((a) => a.type === "ASSET");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setOpen(false);
    setForm({ date: new Date().toISOString().slice(0, 10), expenseAccountId: "", paidFromAccountId: "", amount: "", narration: "" });
    load();
  }

  return (
    <div>
      <PageHeader title="Other Expenses" description="Vendor bill ke bina direct Cash/Bank se kharcha" />

      {!open ? (
        <Button onClick={() => setOpen(true)} className="mb-4">
          <Plus className="w-4 h-4" />
          New Expense
        </Button>
      ) : (
        <Card className="mb-4">
          <CardHeader>
            <p className="text-sm font-semibold text-slate-800">Record an Expense</p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="flex items-end gap-3 flex-wrap">
              <div>
                <Label>Date</Label>
                <Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="flex-1 min-w-48">
                <Label>Narration</Label>
                <Input
                  required
                  value={form.narration}
                  onChange={(e) => setForm({ ...form, narration: e.target.value })}
                  placeholder="e.g. Office tea & snacks"
                />
              </div>
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-28"
                />
              </div>
              <div>
                <Label>Expense Head</Label>
                <select
                  required
                  value={form.expenseAccountId}
                  onChange={(e) => setForm({ ...form, expenseAccountId: e.target.value })}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {expenseAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Paid From</Label>
                <select
                  required
                  value={form.paidFromAccountId}
                  onChange={(e) => setForm({ ...form, paidFromAccountId: e.target.value })}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {cashBankAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              {error && <p className="text-rose-600 text-sm">{error}</p>}
              <Button type="submit" variant="success">
                Save
              </Button>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </form>
            {(expenseAccounts.length === 0 || cashBankAccounts.length === 0) && (
              <p className="text-xs text-amber-600 mt-2">
                {expenseAccounts.length === 0 && "Koi Expense account nahi hai. "}
                {cashBankAccounts.length === 0 && "Koi Cash/Bank account nahi hai. "}
                <Link href="/accounts" className="underline">
                  Chart of Accounts
                </Link>{" "}
                me jaake &quot;Seed Default Chart of Accounts&quot; dabao, dropdown apne aap bhar
                jaayenge.
              </p>
            )}
          </CardBody>
        </Card>
      )}

      <Card>
        <Table>
          <Thead>
            <tr>
              <Th>Date</Th>
              <Th>Narration</Th>
              <Th>Head</Th>
              <Th>Amount</Th>
            </tr>
          </Thead>
          <tbody>
            {entries.map((e) => {
              const expenseLine = e.lines.find((l) => Number(l.debit) > 0);
              return (
                <Tr key={e.id}>
                  <Td>{new Date(e.date).toLocaleDateString()}</Td>
                  <Td>{e.narration}</Td>
                  <Td>{expenseLine?.account.name}</Td>
                  <Td className="font-medium">{Number(expenseLine?.debit || 0).toFixed(2)}</Td>
                </Tr>
              );
            })}
            {entries.length === 0 && <EmptyRow colSpan={4}>Koi expense nahi hai</EmptyRow>}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
