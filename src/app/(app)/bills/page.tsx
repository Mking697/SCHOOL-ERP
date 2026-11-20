"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";
import { Badge, statusTone } from "@/components/ui/badge";
import { Plus, Paperclip } from "lucide-react";
import Link from "next/link";

type Vendor = { id: string; name: string };
type Account = { id: string; code: string; name: string; type: string };
type Bill = {
  id: string;
  vendor: Vendor;
  billNumber: string | null;
  billDate: string;
  dueDate: string;
  description: string;
  amount: string;
  status: "UNPAID" | "PARTIALLY_PAID" | "PAID";
  expenseAccount: Account;
  payments: { amount: string }[];
  attachmentUrl: string | null;
  attachmentName: string | null;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [open, setOpen] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payFrom, setPayFrom] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<{ url: string; name: string } | null>(null);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [form, setForm] = useState({
    vendorId: "",
    billNumber: "",
    billDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date().toISOString().slice(0, 10),
    description: "",
    amount: "",
    expenseAccountId: "",
  });

  async function load() {
    const [b, v, a] = await Promise.all([
      fetch("/api/bills"),
      fetch("/api/vendors"),
      fetch("/api/accounts"),
    ]);
    setBills(await b.json());
    setVendors(await v.json());
    setAccounts(await a.json());
  }

  useEffect(() => {
    load();
  }, []);

  const expenseAccounts = accounts.filter((a) => a.type === "EXPENSE");
  const cashBankAccounts = accounts.filter((a) => a.type === "ASSET");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/bills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, attachmentUrl: attachment?.url, attachmentName: attachment?.name }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setOpen(false);
    setAttachment(null);
    setAttachError(null);
    setForm({
      vendorId: "",
      billNumber: "",
      billDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
      description: "",
      amount: "",
      expenseAccountId: "",
    });
    load();
  }

  async function handleAttachmentChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAttachError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2_000_000) {
      setAttachError("File 2MB se bada hai -- chhoti image ya PDF use karo");
      e.target.value = "";
      return;
    }
    const url = await fileToDataUrl(file);
    setAttachment({ url, name: file.name });
  }

  async function handlePay(id: string) {
    setError(null);
    const res = await fetch(`/api/bills/${id}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: payAmount, method: "CASH", cashOrBankAccountId: payFrom }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setPayingId(null);
    setPayAmount("");
    setPayFrom("");
    load();
  }

  return (
    <div>
      <PageHeader title="Vendor Bills (Payables)" description="Har bill Expense ko Dr aur Vendor Payables ko Cr karti hai" />

      {!open ? (
        <Button onClick={() => setOpen(true)} className="mb-4">
          <Plus className="w-4 h-4" />
          New Bill
        </Button>
      ) : (
        <Card className="mb-4">
          <CardHeader>
            <p className="text-sm font-semibold text-slate-800">New Vendor Bill</p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="flex gap-3 flex-wrap">
                <div>
                  <Label>Vendor</Label>
                  <select
                    required
                    value={form.vendorId}
                    onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select vendor</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Bill Number</Label>
                  <Input value={form.billNumber} onChange={(e) => setForm({ ...form, billNumber: e.target.value })} />
                </div>
                <div>
                  <Label>Bill Date</Label>
                  <Input type="date" required value={form.billDate} onChange={(e) => setForm({ ...form, billDate: e.target.value })} />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input type="date" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-48">
                  <Label>Description</Label>
                  <Input
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g. Stationery supply"
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
                    className="w-32"
                  />
                </div>
                <div>
                  <Label>Expense Account</Label>
                  <select
                    required
                    value={form.expenseAccountId}
                    onChange={(e) => setForm({ ...form, expenseAccountId: e.target.value })}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select</option>
                    {expenseAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} - {a.name}
                      </option>
                    ))}
                  </select>
                  {expenseAccounts.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1 max-w-56">
                      Koi Expense account nahi hai.{" "}
                      <Link href="/accounts" className="underline">
                        Chart of Accounts
                      </Link>{" "}
                      me jaake &quot;Seed Default Chart of Accounts&quot; dabao.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label>Attach Receipt / Invoice (optional)</Label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleAttachmentChange}
                  className="text-sm block"
                />
                {attachError && <p className="text-rose-600 text-xs mt-1">{attachError}</p>}
                {attachment && (
                  <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
                    <Paperclip className="w-3 h-3" />
                    {attachment.name} attach ho gaya
                  </p>
                )}
              </div>
              {error && <p className="text-rose-600 text-sm">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" variant="success">
                  Save Bill
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
              <Th>Vendor</Th>
              <Th>Description</Th>
              <Th>Due Date</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Receipt</Th>
              <Th></Th>
            </tr>
          </Thead>
          <tbody>
            {bills.map((b) => {
              const paid = b.payments.reduce((s, p) => s + Number(p.amount), 0);
              const remaining = Number(b.amount) - paid;
              return (
                <Tr key={b.id}>
                  <Td className="font-medium">{b.vendor.name}</Td>
                  <Td>{b.description}</Td>
                  <Td>{new Date(b.dueDate).toLocaleDateString()}</Td>
                  <Td>{Number(b.amount).toFixed(2)}</Td>
                  <Td>
                    <Badge tone={statusTone(b.status)}>{b.status.replace("_", " ")}</Badge>
                  </Td>
                  <Td>
                    {b.attachmentUrl ? (
                      <a
                        href={b.attachmentUrl}
                        download={b.attachmentName || "receipt"}
                        className="text-indigo-600 hover:underline flex items-center gap-1 text-xs"
                      >
                        <Paperclip className="w-3 h-3" />
                        View
                      </a>
                    ) : (
                      <span className="text-slate-300 text-xs">--</span>
                    )}
                  </Td>
                  <Td>
                    {b.status !== "PAID" &&
                      (payingId === b.id ? (
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            placeholder={remaining.toFixed(2)}
                            className="w-24"
                          />
                          <select
                            value={payFrom}
                            onChange={(e) => setPayFrom(e.target.value)}
                            className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                          >
                            <option value="">Paid via</option>
                            {cashBankAccounts.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name}
                              </option>
                            ))}
                          </select>
                          {cashBankAccounts.length === 0 && (
                            <span className="text-amber-600 text-xs">
                              Koi Cash/Bank account nahi hai --{" "}
                              <Link href="/accounts" className="underline">
                                Chart of Accounts
                              </Link>{" "}
                              seed karo
                            </span>
                          )}
                          <Button size="sm" variant="success" onClick={() => handlePay(b.id)}>
                            Pay
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="secondary" onClick={() => setPayingId(b.id)}>
                          Record Payment
                        </Button>
                      ))}
                  </Td>
                </Tr>
              );
            })}
            {bills.length === 0 && <EmptyRow colSpan={7}>Koi bill nahi hai</EmptyRow>}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
