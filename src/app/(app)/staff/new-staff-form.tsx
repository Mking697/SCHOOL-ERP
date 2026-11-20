"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";

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
  const [createLogin, setCreateLogin] = useState(false);
  const [loginRole, setLoginRole] = useState("TEACHER");
  const [loginPassword, setLoginPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        ...(createLogin ? { loginRole, loginPassword } : {}),
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setForm({ name: "", designation: "", department: "", phone: "", email: "", salary: "" });
    setCreateLogin(false);
    setLoginPassword("");
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

          <div className="border-t border-slate-100 pt-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={createLogin}
                onChange={(e) => setCreateLogin(e.target.checked)}
              />
              Staff & Admin app login access bhi abhi grant karo
            </label>
            {createLogin && (
              <div className="mt-3 space-y-3">
                {!form.email && (
                  <p className="text-xs text-amber-600">Login ke liye upar Email bharna zaroori hai.</p>
                )}
                <div>
                  <Label>Login Role</Label>
                  <Select value={loginRole} onChange={(e) => setLoginRole(e.target.value)} className="w-48">
                    <option value="TEACHER">Teacher</option>
                    <option value="ACCOUNTANT">Accountant</option>
                    <option value="HR">HR</option>
                    <option value="SCHOOL_ADMIN">School Admin</option>
                    <option value="PRINCIPAL">Principal</option>
                  </Select>
                </div>
                <div>
                  <Label>Login Password</Label>
                  <Input
                    type="text"
                    required={createLogin}
                    minLength={6}
                    placeholder="min 6 characters"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-48"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Staff apne phone par <span className="font-mono">/login</span> khol ke ye email/password se
                  login kar sakega, aur &quot;Add to Home Screen&quot; karke app jaisa use kar sakta hai.
                </p>
              </div>
            )}
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
