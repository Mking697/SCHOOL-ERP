"use client";

import { useEffect, useState } from "react";

type Notice = { id: string; title: string; body: string; audience: string; createdAt: string };

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [form, setForm] = useState({ title: "", body: "", audience: "ALL" });
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/notices").then((r) => r.json()).then(setNotices).catch(() => {});
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setForm({ title: "", body: "", audience: "ALL" });
    load();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">Notices / Announcements</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mb-6 max-w-xl space-y-2">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input
          required
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="border rounded px-3 py-2 text-sm w-full"
        />
        <textarea
          required
          placeholder="Message"
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          className="border rounded px-3 py-2 text-sm w-full"
          rows={3}
        />
        <select
          value={form.audience}
          onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}
          className="border rounded px-3 py-2 text-sm w-full"
        >
          <option value="ALL">Everyone</option>
          <option value="TEACHERS">Teachers only</option>
          <option value="PARENTS">Parents only</option>
          <option value="STUDENTS">Students only</option>
        </select>
        <button className="bg-blue-600 text-white rounded px-4 py-2 text-sm">Post Notice</button>
      </form>

      <div className="space-y-3 max-w-xl">
        {notices.map((n) => (
          <div key={n.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{n.title}</p>
              <span className="text-xs bg-gray-100 rounded px-2 py-0.5">{n.audience}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{n.body}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
        {notices.length === 0 && <p className="text-gray-400">Koi notice nahi hai</p>}
      </div>
    </div>
  );
}
