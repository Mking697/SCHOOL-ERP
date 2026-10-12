"use client";

import { useEffect, useState } from "react";

type Req = {
  id: string;
  raisedByName: string;
  raisedByContact: string;
  subject: string;
  description?: string;
  status: string;
  createdAt: string;
};

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<Req[]>([]);
  const [form, setForm] = useState({
    raisedByName: "",
    raisedByContact: "",
    subject: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/service-requests").then((r) => r.json()).then(setRequests).catch(() => {});
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/service-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setForm({ raisedByName: "", raisedByContact: "", subject: "", description: "" });
    load();
  }

  async function setStatus(id: string, status: string) {
    await fetch(`/api/service-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">Service Requests -- Parents &amp; Staff</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mb-6 max-w-xl grid grid-cols-2 gap-2">
        {error && <p className="text-red-600 text-sm col-span-2">{error}</p>}
        <input
          required
          placeholder="Name *"
          value={form.raisedByName}
          onChange={(e) => setForm((f) => ({ ...f, raisedByName: e.target.value }))}
          className="border rounded px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Contact (phone/email) *"
          value={form.raisedByContact}
          onChange={(e) => setForm((f) => ({ ...f, raisedByContact: e.target.value }))}
          className="border rounded px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Subject *"
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          className="border rounded px-3 py-2 text-sm col-span-2"
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="border rounded px-3 py-2 text-sm col-span-2"
        />
        <button className="bg-blue-600 text-white rounded px-4 py-2 text-sm col-span-2">
          Raise Request
        </button>
      </form>

      <div className="bg-white rounded-lg shadow max-w-3xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.raisedByName}</td>
                <td className="p-3">{r.subject}</td>
                <td className="p-3">
                  <span
                    className={
                      r.status === "RESOLVED"
                        ? "text-green-700"
                        : r.status === "IN_PROGRESS"
                        ? "text-yellow-700"
                        : "text-red-600"
                    }
                  >
                    {r.status}
                  </span>
                </td>
                <td className="p-3">
                  <select
                    value={r.status}
                    onChange={(e) => setStatus(r.id, e.target.value)}
                    className="border rounded px-2 py-1 text-xs"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-400">
                  Koi request nahi hai
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
