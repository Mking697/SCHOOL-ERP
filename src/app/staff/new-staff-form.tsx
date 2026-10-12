"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-white rounded px-4 py-2 text-sm"
      >
        + Add Staff
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 max-w-xl space-y-2">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <input
        required
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        className="border rounded px-3 py-2 text-sm w-full"
      />
      <input
        required
        placeholder="Designation (e.g. Teacher, Accountant, Librarian)"
        value={form.designation}
        onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
        className="border rounded px-3 py-2 text-sm w-full"
      />
      <input
        placeholder="Department"
        value={form.department}
        onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
        className="border rounded px-3 py-2 text-sm w-full"
      />
      <input
        placeholder="Phone"
        value={form.phone}
        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        className="border rounded px-3 py-2 text-sm w-full"
      />
      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        className="border rounded px-3 py-2 text-sm w-full"
      />
      <input
        placeholder="Monthly Salary"
        type="number"
        value={form.salary}
        onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))}
        className="border rounded px-3 py-2 text-sm w-full"
      />
      <div className="flex gap-2">
        <button className="bg-blue-600 text-white rounded px-4 py-2 text-sm">Save</button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="bg-gray-200 rounded px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
