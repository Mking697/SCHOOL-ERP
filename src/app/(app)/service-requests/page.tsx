"use client";

import { useEffect, useState } from "react";
import { LifeBuoy } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea, Label } from "@/components/ui/input";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";
import { Badge, statusTone } from "@/components/ui/badge";

type Req = {
  id: string;
  raisedByName: string;
  raisedByContact: string;
  subject: string;
  description?: string;
  status: string;
  createdAt: string;
};

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<Req[]>([]);
  const [form, setForm] = useState({
    raisedByName: "",
    raisedByContact: "",
    subject: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/service-requests").then((r) => r.json()).then(setRequests).catch(() => {});
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/service-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setForm({ raisedByName: "", raisedByContact: "", subject: "", description: "" });
    load();
  }

  async function setStatus(id: string, status: string) {
    await fetch(`/api/service-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div>
      <PageHeader
        title="Service Requests -- Parents & Staff"
        description="Track and resolve service requests raised by parents and staff."
      />

      <Card className="max-w-xl mb-6">
        <CardBody>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            {error && <p className="text-rose-600 text-sm col-span-2">{error}</p>}
            <div>
              <Label>Name</Label>
              <Input
                required
                placeholder="Name *"
                value={form.raisedByName}
                onChange={(e) => setForm((f) => ({ ...f, raisedByName: e.target.value }))}
              />
            </div>
            <div>
              <Label>Contact</Label>
              <Input
                required
                placeholder="Contact (phone/email) *"
                value={form.raisedByContact}
                onChange={(e) => setForm((f) => ({ ...f, raisedByContact: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <Label>Subject</Label>
              <Input
                required
                placeholder="Subject *"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <Button type="submit">
                <LifeBuoy className="h-4 w-4" /> Raise Request
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
              <Th>Subject</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </Thead>
          <tbody>
            {requests.map((r) => (
              <Tr key={r.id}>
                <Td>{r.raisedByName}</Td>
                <Td>{r.subject}</Td>
                <Td>
                  <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                </Td>
                <Td>
                  <Select
                    value={r.status}
                    onChange={(e) => setStatus(r.id, e.target.value)}
                    className="w-auto text-xs py-1"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </Select>
                </Td>
              </Tr>
            ))}
            {requests.length === 0 && <EmptyRow colSpan={4}>Koi request nahi hai</EmptyRow>}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
