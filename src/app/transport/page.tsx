"use client";

import { useEffect, useState } from "react";

type Route = {
  id: string;
  name: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  stops: { id: string; name: string }[];
  students: { id: string }[];
};

export default function TransportPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [form, setForm] = useState({ name: "", vehicleNumber: "", driverName: "", driverPhone: "" });
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/transport-routes").then((r) => r.json()).then(setRoutes).catch(() => {});
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/transport-routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setForm({ name: "", vehicleNumber: "", driverName: "", driverPhone: "" });
    load();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">Transport Management</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mb-6 max-w-xl grid grid-cols-2 gap-2">
        {error && <p className="text-red-600 text-sm col-span-2">{error}</p>}
        <input
          required
          placeholder="Route name e.g. Route 1 - North"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="border rounded px-3 py-2 text-sm col-span-2"
        />
        <input
          placeholder="Vehicle Number"
          value={form.vehicleNumber}
          onChange={(e) => setForm((f) => ({ ...f, vehicleNumber: e.target.value }))}
          className="border rounded px-3 py-2 text-sm"
        />
        <input
          placeholder="Driver Name"
          value={form.driverName}
          onChange={(e) => setForm((f) => ({ ...f, driverName: e.target.value }))}
          className="border rounded px-3 py-2 text-sm"
        />
        <input
          placeholder="Driver Phone"
          value={form.driverPhone}
          onChange={(e) => setForm((f) => ({ ...f, driverPhone: e.target.value }))}
          className="border rounded px-3 py-2 text-sm col-span-2"
        />
        <button className="bg-blue-600 text-white rounded px-4 py-2 text-sm col-span-2">
          Add Route
        </button>
      </form>

      <div className="space-y-3 max-w-2xl">
        {routes.map((r) => (
          <div key={r.id} className="bg-white rounded-lg shadow p-4">
            <p className="font-semibold">{r.name}</p>
            <p className="text-sm text-gray-600">
              {r.vehicleNumber || "-"} · {r.driverName || "-"} {r.driverPhone ? `(${r.driverPhone})` : ""}
            </p>
            <p className="text-xs text-gray-400 mt-1">{r.students.length} students assigned</p>
          </div>
        ))}
        {routes.length === 0 && <p className="text-gray-400">Koi route nahi bana</p>}
      </div>
    </div>
  );
}
