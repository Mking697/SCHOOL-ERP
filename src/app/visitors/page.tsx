"use client";

import { useEffect, useState } from "react";

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
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">Visitor Management</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mb-6 max-w-xl grid grid-cols-2 gap-2">
        {error && <p className="text-red-600 text-sm col-span-2">{error}</p>}
        <input
          required
          placeholder="Visitor name *"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="border rounded px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Phone *"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className="border rounded px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Purpose of visit *"
          value={form.purpose}
          onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
          className="border rounded px-3 py-2 text-sm col-span-2"
        />
        <input
          placeholder="Person to meet"
          value={form.personToMeet}
          onChange={(e) => setForm((f) => ({ ...f, personToMeet: e.target.value }))}
          className="border rounded px-3 py-2 text-sm col-span-2"
        />
        <button className="bg-blue-600 text-white rounded px-4 py-2 text-sm col-span-2">
          Check In
        </button>
      </form>

      <div className="bg-white rounded-lg shadow max-w-3xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Purpose</th>
              <th className="p-3">Check In</th>
              <th className="p-3">Check Out</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {visitors.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="p-3">{v.name}</td>
                <td className="p-3">{v.purpose}</td>
                <td className="p-3">{new Date(v.checkIn).toLocaleString()}</td>
                <td className="p-3">
                  {v.checkOut ? new Date(v.checkOut).toLocaleString() : "-"}
                </td>
                <td className="p-3">
                  {!v.checkOut && (
                    <button
                      onClick={() => checkOut(v.id)}
                      className="bg-gray-700 text-white rounded px-2 py-1 text-xs"
                    >
                      Check Out
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {visitors.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  Koi visitor nahi aaya abhi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
