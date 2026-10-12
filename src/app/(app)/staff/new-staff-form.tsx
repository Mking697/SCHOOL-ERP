"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export default function NewStaffForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    designation: "",
    department: "",
    phone: "",
    email: "",
    salary: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setForm({ name: "", designation: "", department: "", phone: "", email: "", salary: "" });
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add Staff
      </Button>
    );
  }

  return (
    <Card className="max-w-xl w-full">
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-rose-600 text-sm">{error}</p>}
          <div>
            <Label>Name</Label>
            <Input
              required
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <Label>Designation</Label>
            <Input
              required
              placeholder="Designation (e.g. Teacher, Accountant, Librarian)"
              value={form.designation}
              onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
            />
          </div>
          <div>
            <Label>Department</Label>
            <Input
              placeholder="Department"
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <Label>Monthly Salary</Label>
            <Input
              placeholder="Monthly Salary"
              type="number"
              value={form.salary}
              onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
