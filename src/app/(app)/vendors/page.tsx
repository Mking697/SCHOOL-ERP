"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";

type Vendor = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  bills: { amount: string; status: string }[];
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/vendors");
    setVendors(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setForm({ name: "", phone: "", email: "", address: "" });
    load();
  }

  return (
    <div>
      <PageHeader title="Vendors / Suppliers" description="Vendor directory -- bills isi se link hote hain" />

      <Card className="mb-4">
        <CardHeader>
          <p className="text-sm font-semibold text-slate-800">New Vendor</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleAdd} className="flex items-end gap-3 flex-wrap">
            <div>
              <Label>Name</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            {error && <p className="text-rose-600 text-sm">{error}</p>}
            <Button type="submit">Add Vendor</Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <Table>
          <Thead>
            <tr>
              <Th>Name</Th>
              <Th>Contact</Th>
              <Th>Bills</Th>
              <Th>Unpaid Total</Th>
            </tr>
          </Thead>
          <tbody>
            {vendors.map((v) => {
              const unpaid = v.bills.filter((b) => b.status !== "PAID").reduce((s, b) => s + Number(b.amount), 0);
              return (
                <Tr key={v.id}>
                  <Td className="font-medium">{v.name}</Td>
                  <Td>
                    {v.phone}
                    {v.email && <span className="block text-xs text-slate-400">{v.email}</span>}
                  </Td>
                  <Td>{v.bills.length}</Td>
                  <Td className={unpaid > 0 ? "text-amber-600 font-medium" : "text-slate-400"}>
                    {unpaid.toFixed(2)}
                  </Td>
                </Tr>
              );
            })}
            {vendors.length === 0 && <EmptyRow colSpan={4}>Koi vendor nahi hai</EmptyRow>}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
