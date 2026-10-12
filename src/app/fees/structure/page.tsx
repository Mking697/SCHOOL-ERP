"use client";

import { useEffect, useState } from "react";

type ClassLevel = { id: string; name: string };
type FeeHead = { id: string; name: string };
type Structure = {
  id: string;
  amount: string;
  frequency: string;
  feeHead: FeeHead;
  classLevel: ClassLevel;
};

export default function FeeStructurePage() {
  const [classes, setClasses] = useState<ClassLevel[]>([]);
  const [feeHeads, setFeeHeads] = useState<FeeHead[]>([]);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [newHeadName, setNewHeadName] = useState("");
  const [form, setForm] = useState({ classLevelId: "", feeHeadId: "", amount: "", frequency: "TERM" });
  const [error, setError] = useState<string | null>(null);

  function loadAll() {
    fetch("/api/classes").then((r) => r.json()).then(setClasses).catch(() => {});
    fetch("/api/fee-heads").then((r) => r.json()).then(setFeeHeads).catch(() => {});
    fetch("/api/fee-structures").then((r) => r.json()).then(setStructures).catch(() => {});
  }

  useEffect(loadAll, []);

  async function addFeeHead(e: React.FormEvent) {
    e.preventDefault();
    if (!newHeadName) return;
    const res = await fetch("/api/fee-heads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newHeadName }),
    });
    if (res.ok) {
      setNewHeadName("");
      loadAll();
    }
  }

  async function addStructure(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/fee-structures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setForm({ classLevelId: "", feeHeadId: "", amount: "", frequency: "TERM" });
    loadAll();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">Fee Structure Setup</h1>

      <div className="grid grid-cols-2 gap-6 max-w-4xl">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">Fee Heads</h2>
          <form onSubmit={addFeeHead} className="flex gap-2 mb-3">
            <input
              value={newHeadName}
              onChange={(e) => setNewHeadName(e.target.value)}
              placeholder="e.g. Tuition Fee"
              className="border rounded px-3 py-2 text-sm flex-1"
            />
            <button className="bg-gray-700 text-white rounded px-3 py-2 text-sm">Add</button>
          </form>
          <div className="flex flex-wrap gap-2">
            {feeHeads.map((h) => (
              <span key={h.id} className="bg-gray-100 rounded px-3 py-1 text-sm">
                {h.name}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">Assign Fee to Class</h2>
          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
          <form onSubmit={addStructure} className="space-y-2">
            <select
              required
              value={form.classLevelId}
              onChange={(e) => setForm((f) => ({ ...f, classLevelId: e.target.value }))}
              className="border rounded px-3 py-2 text-sm w-full"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              required
              value={form.feeHeadId}
              onChange={(e) => setForm((f) => ({ ...f, feeHeadId: e.target.value }))}
              className="border rounded px-3 py-2 text-sm w-full"
            >
              <option value="">Select Fee Head</option>
              {feeHeads.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
            <input
              required
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="border rounded px-3 py-2 text-sm w-full"
            />
            <select
              value={form.frequency}
              onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
              className="border rounded px-3 py-2 text-sm w-full"
            >
              <option value="ONE_TIME">One Time</option>
              <option value="MONTHLY">Monthly</option>
              <option value="TERM">Per Term</option>
              <option value="ANNUAL">Annual</option>
            </select>
            <button className="bg-blue-600 text-white rounded px-4 py-2 text-sm w-full">
              Add to Structure
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mt-6 max-w-4xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Class</th>
              <th className="p-3">Fee Head</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Frequency</th>
            </tr>
          </thead>
          <tbody>
            {structures.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3">{s.classLevel.name}</td>
                <td className="p-3">{s.feeHead.name}</td>
                <td className="p-3">₹{s.amount}</td>
                <td className="p-3">{s.frequency}</td>
              </tr>
            ))}
            {structures.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-400">
                  Koi fee structure nahi bani
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
