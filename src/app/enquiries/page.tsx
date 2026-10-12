"use client";

import { useEffect, useState } from "react";

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
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">Admission Enquiries</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-4 mb-6 max-w-2xl grid grid-cols-2 gap-3"
      >
        {error && <p className="text-red-600 text-sm col-span-2">{error}</p>}
        <input
          required
          placeholder="Student name *"
          value={form.studentName}
          onChange={(e) => setForm((f) => ({ ...f, studentName: e.target.value }))}
          className="border rounded px-3 py-2"
        />
        <input
          required
          placeholder="Phone *"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className="border rounded px-3 py-2"
        />
        <input
          placeholder="Guardian name"
          value={form.guardianName}
          onChange={(e) => setForm((f) => ({ ...f, guardianName: e.target.value }))}
          className="border rounded px-3 py-2"
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="border rounded px-3 py-2"
        />
        <input
          placeholder="Class applied for"
          value={form.classApplied}
          onChange={(e) => setForm((f) => ({ ...f, classApplied: e.target.value }))}
          className="border rounded px-3 py-2"
        />
        <button className="bg-blue-600 text-white rounded px-4 py-2 text-sm">
          Add Enquiry
        </button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden max-w-4xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Student</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Class</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-3">{e.studentName}</td>
                <td className="p-3">{e.phone}</td>
                <td className="p-3">{e.classApplied || "-"}</td>
                <td className="p-3">{e.status}</td>
                <td className="p-3">
                  <select
                    value={e.status}
                    onChange={(ev) => setStatus(e.id, ev.target.value)}
                    className="border rounded px-2 py-1 text-xs"
                  >
                    <option value="NEW">NEW</option>
                    <option value="FOLLOW_UP">FOLLOW_UP</option>
                    <option value="ADMITTED">ADMITTED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </td>
              </tr>
            ))}
            {enquiries.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  Koi enquiry nahi hai
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
