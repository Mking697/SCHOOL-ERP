"use client";

import { useEffect, useState } from "react";
import { Plus, ListChecks } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";

type ClassLevel = { id: string; name: string };
type FeeHead = { id: string; name: string };
type Structure = {
  id: string;
  amount: string;
  frequency: string;
  feeHead: FeeHead;
  classLevel: ClassLevel;
};

export default function FeeStructurePage() {
  const [classes, setClasses] = useState<ClassLevel[]>([]);
  const [feeHeads, setFeeHeads] = useState<FeeHead[]>([]);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [newHeadName, setNewHeadName] = useState("");
  const [form, setForm] = useState({ classLevelId: "", feeHeadId: "", amount: "", frequency: "TERM" });
  const [error, setError] = useState<string | null>(null);

  function loadAll() {
    fetch("/api/classes").then((r) => r.json()).then(setClasses).catch(() => {});
    fetch("/api/fee-heads").then((r) => r.json()).then(setFeeHeads).catch(() => {});
    fetch("/api/fee-structures").then((r) => r.json()).then(setStructures).catch(() => {});
  }

  useEffect(loadAll, []);

  async function addFeeHead(e: React.FormEvent) {
    e.preventDefault();
    if (!newHeadName) return;
    const res = await fetch("/api/fee-heads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newHeadName }),
    });
    if (res.ok) {
      setNewHeadName("");
      loadAll();
    }
  }

  async function addStructure(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/fee-structures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setForm({ classLevelId: "", feeHeadId: "", amount: "", frequency: "TERM" });
    loadAll();
  }

  return (
    <>
      <PageHeader title="Fee Structure Setup" description="Define fee heads and assign amounts per class" />

      <div className="grid grid-cols-2 gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">Fee Heads</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={addFeeHead} className="flex gap-2 mb-3">
              <Input
                value={newHeadName}
                onChange={(e) => setNewHeadName(e.target.value)}
                placeholder="e.g. Tuition Fee"
                className="flex-1"
              />
              <Button type="submit" variant="secondary">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </form>
            <div className="flex flex-wrap gap-2">
              {feeHeads.map((h) => (
                <Badge key={h.id} tone="slate">
                  {h.name}
                </Badge>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">Assign Fee to Class</h2>
          </CardHeader>
          <CardBody>
            {error && <p className="text-rose-600 text-sm mb-2">{error}</p>}
            <form onSubmit={addStructure} className="space-y-3">
              <div>
                <Label>Class</Label>
                <Select
                  required
                  value={form.classLevelId}
                  onChange={(e) => setForm((f) => ({ ...f, classLevelId: e.target.value }))}
                >
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Fee Head</Label>
                <Select
                  required
                  value={form.feeHeadId}
                  onChange={(e) => setForm((f) => ({ ...f, feeHeadId: e.target.value }))}
                >
                  <option value="">Select Fee Head</option>
                  {feeHeads.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Amount</Label>
                <Input
                  required
                  type="number"
                  placeholder="Amount"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div>
                <Label>Frequency</Label>
                <Select
                  value={form.frequency}
                  onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
                >
                  <option value="ONE_TIME">One Time</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="TERM">Per Term</option>
                  <option value="ANNUAL">Annual</option>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4" />
                Add to Structure
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6 max-w-4xl overflow-hidden">
        <Table>
          <Thead>
            <Tr>
              <Th>Class</Th>
              <Th>Fee Head</Th>
              <Th>Amount</Th>
              <Th>Frequency</Th>
            </Tr>
          </Thead>
          <tbody>
            {structures.map((s) => (
              <Tr key={s.id}>
                <Td>{s.classLevel.name}</Td>
                <Td>{s.feeHead.name}</Td>
                <Td>₹{s.amount}</Td>
                <Td>{s.frequency}</Td>
              </Tr>
            ))}
            {structures.length === 0 && (
              <EmptyRow colSpan={4}>
                <div className="flex flex-col items-center gap-1">
                  <ListChecks className="h-5 w-5 text-slate-300" />
                  Koi fee structure nahi bani
                </div>
              </EmptyRow>
            )}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
