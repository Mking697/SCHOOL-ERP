"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";
import { Plus } from "lucide-react";

type Holiday = { id: string; date: string; title: string; description?: string };

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [form, setForm] = useState({ date: "", title: "", description: "" });
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/holidays").then((r) => r.json()).then(setHolidays).catch(() => {});
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/holidays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setForm({ date: "", title: "", description: "" });
    load();
  }

  return (
    <div>
      <PageHeader title="Holidays & School Planner" description="Manage the school's holiday calendar" />

      <Card className="mb-6 max-w-xl">
        <CardBody>
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            {error && <p className="text-rose-600 text-sm">{error}</p>}
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div className="flex-1">
              <Label>Title</Label>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <Button variant="primary">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card className="max-w-xl">
        <Table>
          <Thead>
            <tr>
              <Th>Date</Th>
              <Th>Title</Th>
            </tr>
          </Thead>
          <tbody>
            {holidays.map((h) => (
              <Tr key={h.id}>
                <Td>{new Date(h.date).toLocaleDateString()}</Td>
                <Td>{h.title}</Td>
              </Tr>
            ))}
            {holidays.length === 0 && (
              <EmptyRow colSpan={2}>Koi holiday add nahi ki gayi</EmptyRow>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
