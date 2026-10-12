"use client";

import { useEffect, useState } from "react";

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
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">Holidays &amp; School Planner</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mb-6 max-w-xl flex gap-3 items-end">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div>
          <label className="block text-sm mb-1">Date</label>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="border rounded px-3 py-2"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm mb-1">Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <button className="bg-blue-600 text-white rounded px-4 py-2 text-sm">Add</button>
      </form>

      <div className="bg-white rounded-lg shadow max-w-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Title</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map((h) => (
              <tr key={h.id} className="border-t">
                <td className="p-3">{new Date(h.date).toLocaleDateString()}</td>
                <td className="p-3">{h.title}</td>
              </tr>
            ))}
            {holidays.length === 0 && (
              <tr>
                <td colSpan={2} className="p-6 text-center text-gray-400">
                  Koi holiday add nahi ki gayi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
