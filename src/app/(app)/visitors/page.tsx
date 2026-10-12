"use client";

import { useEffect, useState } from "react";
import { UserCheck2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";

type Visitor = {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  personToMeet?: string;
  checkIn: string;
  checkOut?: string;
};

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", purpose: "", personToMeet: "" });
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/visitors").then((r) => r.json()).then(setVisitors).catch(() => {});
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/visitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setForm({ name: "", phone: "", purpose: "", personToMeet: "" });
    load();
  }

  async function checkOut(id: string) {
    await fetch(`/api/visitors/${id}`, { method: "PATCH" });
    load();
  }

  return (
    <div>
      <PageHeader
        title="Visitor Management"
        description="Log and track visitors entering the school premises."
      />

      <Card className="max-w-xl mb-6">
        <CardBody>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            {error && <p className="text-rose-600 text-sm col-span-2">{error}</p>}
            <div>
              <Label>Visitor name</Label>
              <Input
                required
                placeholder="Visitor name *"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                required
                placeholder="Phone *"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <Label>Purpose of visit</Label>
              <Input
                required
                placeholder="Purpose of visit *"
                value={form.purpose}
                onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <Label>Person to meet</Label>
              <Input
                placeholder="Person to meet"
                value={form.personToMeet}
                onChange={(e) => setForm((f) => ({ ...f, personToMeet: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <Button type="submit">
                <UserCheck2 className="h-4 w-4" /> Check In
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card className="max-w-3xl overflow-hidden">
        <Table>
          <Thead>
            <tr>
              <Th>Name</Th>
              <Th>Purpose</Th>
              <Th>Check In</Th>
              <Th>Check Out</Th>
              <Th></Th>
            </tr>
          </Thead>
          <tbody>
            {visitors.map((v) => (
              <Tr key={v.id}>
                <Td>{v.name}</Td>
                <Td>{v.purpose}</Td>
                <Td>{new Date(v.checkIn).toLocaleString()}</Td>
                <Td>
                  {v.checkOut ? new Date(v.checkOut).toLocaleString() : "-"}
                </Td>
                <Td>
                  {!v.checkOut && (
                    <Button size="sm" variant="secondary" onClick={() => checkOut(v.id)}>
                      Check Out
                    </Button>
                  )}
                </Td>
              </Tr>
            ))}
            {visitors.length === 0 && <EmptyRow colSpan={5}>Koi visitor nahi aaya abhi</EmptyRow>}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
