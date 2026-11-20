"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";

type Account = { id: string; code: string; name: string; type: string; isSystem: boolean };

const TYPE_LABELS: Record<string, string> = {
  ASSET: "Assets",
  LIABILITY: "Liabilities",
  EQUITY: "Equity",
  INCOME: "Income",
  EXPENSE: "Expenses",
};

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: "", name: "", type: "ASSET" });
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/accounts");
    setAccounts(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSeed() {
    setSeeding(true);
    setSeedMsg(null);
    const res = await fetch("/api/accounts/seed-defaults", { method: "POST" });
    const data = await res.json();
    setSeedMsg(
      data.created > 0
        ? `${data.created} naye standard account(s) add ho gaye.`
        : "Aapke paas pehle se saare standard accounts hain -- kuch naya add nahi hua.",
    );
    await load();
    setSeeding(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setForm({ code: "", name: "", type: "ASSET" });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Ye account delete karna hai? Sirf un accounts ko delete kiya ja sakta hai jinme abhi tak koi transaction nahi hui.")) return;
    const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    load();
  }

  const grouped = Object.keys(TYPE_LABELS).map((type) => ({
    type,
    label: TYPE_LABELS[type],
    accounts: accounts.filter((a) => a.type === type),
  }));
  const hasExpense = accounts.some((a) => a.type === "EXPENSE");
  const hasAsset = accounts.some((a) => a.type === "ASSET");

  return (
    <div>
      <PageHeader title="Chart of Accounts" description="Har account yahan define hota hai -- Journal Entries isi pe post hoti hain" />

      {!loading && (!hasExpense || !hasAsset) && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Aapke paas abhi {!hasAsset && "Cash/Bank (Asset) "} {!hasAsset && !hasExpense && "aur "}
          {!hasExpense && "koi Expense account "}
          nahi hai -- isliye Vendor Bills, Other Expenses aur Petty Cash Book ke dropdown khaali
          dikhenge. Neeche &quot;Seed Default Chart of Accounts&quot; dabao, ye sab ban jaayega.
        </div>
      )}

      <Card className="mb-4">
        <CardBody>
          <p className="text-sm text-slate-600 mb-3">
            Standard school Chart of Accounts (Cash, Bank, Petty Cash, Student Receivables, Vendor
            Payables, Income/Expense heads -- 16 accounts total) ek click me set up/complete karo. Jo
            pehle se hain unhe dobara nahi banayega, sirf jo missing hain wahi add honge -- hamesha
            safe hai dobara dabana.
          </p>
          <Button onClick={handleSeed} disabled={seeding}>
            {seeding ? "Setting up..." : "Seed Default Chart of Accounts"}
          </Button>
          {seedMsg && <p className="text-sm text-emerald-700 mt-2">{seedMsg}</p>}
        </CardBody>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <p className="text-sm font-semibold text-slate-800">New Account</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleAdd} className="flex items-end gap-3 flex-wrap">
            <div>
              <Label>Code</Label>
              <Input
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-24"
                placeholder="5050"
              />
            </div>
            <div>
              <Label>Name</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-56"
                placeholder="e.g. Internet Expense"
              />
            </div>
            <div>
              <Label>Type</Label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                {Object.entries(TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            {error && <p className="text-rose-600 text-sm">{error}</p>}
            <Button type="submit">Add Account</Button>
          </form>
          <p className="text-xs text-slate-400 mt-2">
            Type zaroori hai sahi chuno: paise jahan rakhe/milte hain (Cash/Bank) = Assets, jo kisi ko
            dena hai = Liabilities, jo kamaya = Income, jo kharch hua = Expenses.
          </p>
        </CardBody>
      </Card>

      {grouped.map(
        (g) =>
          g.accounts.length > 0 && (
            <Card key={g.type} className="mb-4">
              <CardHeader>
                <p className="text-sm font-semibold text-slate-800">{g.label}</p>
              </CardHeader>
              <Table>
                <Thead>
                  <tr>
                    <Th>Code</Th>
                    <Th>Name</Th>
                    <Th></Th>
                  </tr>
                </Thead>
                <tbody>
                  {g.accounts.map((a) => (
                    <Tr key={a.id}>
                      <Td className="font-mono text-slate-500">{a.code}</Td>
                      <Td>{a.name}</Td>
                      <Td>
                        {!a.isSystem && (
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="text-slate-400 hover:text-rose-600"
                            title="Delete (sirf agar koi transaction nahi hui)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          ),
      )}
      {!loading && accounts.length === 0 && (
        <Card>
          <Table>
            <tbody>
              <EmptyRow colSpan={3}>Koi account nahi hai</EmptyRow>
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
}
