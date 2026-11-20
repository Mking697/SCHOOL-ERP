"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";
import { Printer } from "lucide-react";
import Link from "next/link";

type Account = { id: string; code: string; name: string; type: string };
type Row = { date: string; narration: string; reference: string | null; debit: number; credit: number; balance: number };
type Ledger = { account: Account; openingBalance: number; closingBalance: number; rows: Row[] };

function firstOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export default function PettyCashBookPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [ledger, setLedger] = useState<Ledger | null>(null);

  useEffect(() => {
    fetch("/api/accounts").then((r) => r.json()).then((list: Account[]) => {
      const cashLike = list.filter((a) => a.type === "ASSET");
      setAccounts(cashLike);
      const pettyCash = cashLike.find((a) => a.name.toLowerCase().includes("petty"));
      const cash = cashLike.find((a) => a.code === "1010");
      setAccountId(pettyCash?.id || cash?.id || cashLike[0]?.id || "");
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!accountId) return;
    fetch(`/api/accounts/${accountId}/ledger?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then(setLedger);
  }, [accountId, from, to]);

  return (
    <div>
      <div className="print:hidden">
        <PageHeader title="Petty Cash Book" description="Triple column: Date, Particulars, Debit, Credit, Balance" />
      </div>

      <Card className="mb-4 print:hidden">
        <CardBody>
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <Label>Account</Label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} - {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>From</Label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <Label>To</Label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer className="w-4 h-4" />
              Print
            </Button>
          </div>
          {loaded && accounts.length === 0 && (
            <p className="text-xs text-amber-600 mt-3">
              Koi Cash/Bank account nahi hai.{" "}
              <Link href="/accounts" className="underline">
                Chart of Accounts
              </Link>{" "}
              me jaake &quot;Seed Default Chart of Accounts&quot; dabao -- Cash, Bank aur Petty
              Cash accounts ban jaayenge, phir yahan select ho sakenge.
            </p>
          )}
        </CardBody>
      </Card>

      {ledger && (
        <Card>
          <div className="p-4 print:p-0">
            <h2 className="hidden print:block text-lg font-semibold mb-2">
              {ledger.account.name} -- {from} to {to}
            </h2>
            <Table>
              <Thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Particulars</Th>
                  <Th>Debit</Th>
                  <Th>Credit</Th>
                  <Th>Balance</Th>
                </tr>
              </Thead>
              <tbody>
                <Tr>
                  <Td colSpan={4} className="font-medium text-slate-500">
                    Opening Balance
                  </Td>
                  <Td className="font-medium">{ledger.openingBalance.toFixed(2)}</Td>
                </Tr>
                {ledger.rows.map((r, i) => (
                  <Tr key={i}>
                    <Td>{new Date(r.date).toLocaleDateString()}</Td>
                    <Td>
                      {r.narration}
                      {r.reference && <span className="block text-xs text-slate-400">{r.reference}</span>}
                    </Td>
                    <Td>{r.debit > 0 ? r.debit.toFixed(2) : ""}</Td>
                    <Td>{r.credit > 0 ? r.credit.toFixed(2) : ""}</Td>
                    <Td className="font-medium">{r.balance.toFixed(2)}</Td>
                  </Tr>
                ))}
                {ledger.rows.length === 0 && <EmptyRow colSpan={5}>Is period me koi entry nahi hai</EmptyRow>}
                <Tr className="bg-slate-50">
                  <Td colSpan={4} className="font-semibold text-slate-700">
                    Closing Balance
                  </Td>
                  <Td className="font-semibold">{ledger.closingBalance.toFixed(2)}</Td>
                </Tr>
              </tbody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
