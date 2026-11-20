"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

type Account = { id: string; code: string; name: string; type: string };
type Line = { id: string; account: Account; debit: string; credit: string };
type Entry = { id: string; date: string; narration: string; reference: string | null; lines: Line[] };

function emptyLine() {
  return { accountId: "", debit: "", credit: "" };
}

export default function JournalEntriesPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [narration, setNarration] = useState("");
  const [reference, setReference] = useState("");
  const [lines, setLines] = useState([emptyLine(), emptyLine()]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [a, e] = await Promise.all([fetch("/api/accounts"), fetch("/api/journal-entries")]);
    setAccounts(await a.json());
    setEntries(await e.json());
  }

  useEffect(() => {
    load();
  }, []);

  const totalDebit = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  function updateLine(i: number, patch: Partial<{ accountId: string; debit: string; credit: string }>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!balanced) {
      setError("Entry balance nahi hai -- Debit total = Credit total hona chahiye");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/journal-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          narration,
          reference: reference || undefined,
          lines: lines
            .filter((l) => l.accountId && (l.debit || l.credit))
            .map((l) => ({ accountId: l.accountId, debit: Number(l.debit || 0), credit: Number(l.credit || 0) })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setOpen(false);
      setNarration("");
      setReference("");
      setLines([emptyLine(), emptyLine()]);
      load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Journal Entries" description="Double-entry: har entry me Debit total = Credit total hona chahiye" />

      {!open ? (
        <Button onClick={() => setOpen(true)} className="mb-4">
          <Plus className="w-4 h-4" />
          New Journal Entry
        </Button>
      ) : (
        <Card className="mb-4">
          <CardHeader>
            <p className="text-sm font-semibold text-slate-800">New Journal Entry</p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-3 flex-wrap">
                <div>
                  <Label>Date</Label>
                  <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="flex-1 min-w-48">
                  <Label>Narration</Label>
                  <Input
                    required
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                    placeholder="e.g. Office rent paid in cash"
                  />
                </div>
                <div>
                  <Label>Reference (optional)</Label>
                  <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Bill #..." />
                </div>
              </div>

              <div className="space-y-2">
                {lines.map((l, i) => (
                  <div key={i} className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label>Account</Label>
                      <select
                        required
                        value={l.accountId}
                        onChange={(e) => updateLine(i, { accountId: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="">Select account</option>
                        {accounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.code} - {a.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-32">
                      <Label>Debit</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={l.debit}
                        onChange={(e) => updateLine(i, { debit: e.target.value, credit: "" })}
                      />
                    </div>
                    <div className="w-32">
                      <Label>Credit</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={l.credit}
                        onChange={(e) => updateLine(i, { credit: e.target.value, debit: "" })}
                      />
                    </div>
                    {lines.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="secondary" size="sm" onClick={() => setLines((p) => [...p, emptyLine()])}>
                  <Plus className="w-3.5 h-3.5" />
                  Add Line
                </Button>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className={balanced ? "text-emerald-600" : "text-rose-600"}>
                  Debit: {totalDebit.toFixed(2)} | Credit: {totalCredit.toFixed(2)}
                  {balanced ? " -- Balanced" : " -- Not balanced"}
                </span>
              </div>

              {error && <p className="text-rose-600 text-sm">{error}</p>}

              <div className="flex gap-2">
                <Button type="submit" variant="success" disabled={saving || !balanced}>
                  Save Entry
                </Button>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <Card>
        <Table>
          <Thead>
            <tr>
              <Th>Date</Th>
              <Th>Narration</Th>
              <Th>Lines</Th>
              <Th>Amount</Th>
            </tr>
          </Thead>
          <tbody>
            {entries.map((e) => (
              <Tr key={e.id}>
                <Td>{new Date(e.date).toLocaleDateString()}</Td>
                <Td>
                  {e.narration}
                  {e.reference && <span className="block text-xs text-slate-400">{e.reference}</span>}
                </Td>
                <Td>
                  <div className="text-xs space-y-0.5">
                    {e.lines.map((l) => (
                      <div key={l.id}>
                        {l.account.name}: {Number(l.debit) > 0 ? `Dr ${l.debit}` : `Cr ${l.credit}`}
                      </div>
                    ))}
                  </div>
                </Td>
                <Td className="font-medium">
                  {e.lines.reduce((s, l) => s + Number(l.debit), 0).toFixed(2)}
                </Td>
              </Tr>
            ))}
            {entries.length === 0 && <EmptyRow colSpan={4}>Koi journal entry nahi hai</EmptyRow>}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
