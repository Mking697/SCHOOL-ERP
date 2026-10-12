"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge, statusTone } from "@/components/ui/badge";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";
import { Plus } from "lucide-react";

type Enquiry = {
  id: string;
  studentName: string;
  guardianName?: string;
  phone: string;
  email?: string;
  classApplied?: string;
  status: string;
  createdAt: string;
};

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    studentName: "",
    guardianName: "",
    phone: "",
    email: "",
    classApplied: "",
  });

  function load() {
    fetch("/api/enquiries")
      .then((r) => r.json())
      .then(setEnquiries)
      .catch(() => {});
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setForm({ studentName: "", guardianName: "", phone: "", email: "", classApplied: "" });
    load();
  }

  async function setStatus(id: string, status: string) {
    await fetch(`/api/enquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div>
      <PageHeader title="Admission Enquiries" description="Track and follow up on admission enquiries" />

      <Card className="mb-6 max-w-2xl">
        <CardBody>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            {error && <p className="text-rose-600 text-sm col-span-2">{error}</p>}
            <Input
              required
              placeholder="Student name *"
              value={form.studentName}
              onChange={(e) => setForm((f) => ({ ...f, studentName: e.target.value }))}
            />
            <Input
              required
              placeholder="Phone *"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <Input
              placeholder="Guardian name"
              value={form.guardianName}
              onChange={(e) => setForm((f) => ({ ...f, guardianName: e.target.value }))}
            />
            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
            <Input
              placeholder="Class applied for"
              value={form.classApplied}
              onChange={(e) => setForm((f) => ({ ...f, classApplied: e.target.value }))}
            />
            <Button type="submit" variant="primary" className="justify-self-start">
              <Plus className="w-4 h-4" />
              Add Enquiry
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card className="max-w-4xl">
        <Table>
          <Thead>
            <tr>
              <Th>Student</Th>
              <Th>Phone</Th>
              <Th>Class</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </Thead>
          <tbody>
            {enquiries.map((e) => (
              <Tr key={e.id}>
                <Td>{e.studentName}</Td>
                <Td>{e.phone}</Td>
                <Td>{e.classApplied || "-"}</Td>
                <Td>
                  <Badge tone={statusTone(e.status)}>{e.status}</Badge>
                </Td>
                <Td>
                  <Select
                    value={e.status}
                    onChange={(ev) => setStatus(e.id, ev.target.value)}
                    className="text-xs w-auto"
                  >
                    <option value="NEW">NEW</option>
                    <option value="FOLLOW_UP">FOLLOW_UP</option>
                    <option value="ADMITTED">ADMITTED</option>
                    <option value="CLOSED">CLOSED</option>
                  </Select>
                </Td>
              </Tr>
            ))}
            {enquiries.length === 0 && (
              <EmptyRow colSpan={5}>Koi enquiry nahi hai</EmptyRow>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
