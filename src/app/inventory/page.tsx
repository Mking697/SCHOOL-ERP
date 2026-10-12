"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  unit?: string;
  location?: string;
};

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState({ name: "", category: "", quantity: "0", unit: "", location: "" });
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/inventory").then((r) => r.json()).then(setItems).catch(() => {});
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setForm({ name: "", category: "", quantity: "0", unit: "", location: "" });
    load();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">Inventory &amp; Assets</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mb-6 max-w-xl grid grid-cols-2 gap-2">
        {error && <p className="text-red-600 text-sm col-span-2">{error}</p>}
        <input
          required
          placeholder="Item name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="border rounded px-3 py-2 text-sm col-span-2"
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className="border rounded px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
          className="border rounded px-3 py-2 text-sm"
        />
        <input
          placeholder="Unit (pcs, kg...)"
          value={form.unit}
          onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
          className="border rounded px-3 py-2 text-sm"
        />
        <input
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          className="border rounded px-3 py-2 text-sm"
        />
        <button className="bg-blue-600 text-white rounded px-4 py-2 text-sm col-span-2">
          Add Item
        </button>
      </form>

      <div className="bg-white rounded-lg shadow max-w-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Item</th>
              <th className="p-3">Category</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Location</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="p-3">{i.name}</td>
                <td className="p-3">{i.category || "-"}</td>
                <td className="p-3">
                  {i.quantity} {i.unit || ""}
                </td>
                <td className="p-3">{i.location || "-"}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-400">
                  Koi item nahi hai
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
