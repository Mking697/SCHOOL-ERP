"use client";

import { useEffect, useState } from "react";

type ClassLevel = { id: string; name: string; sections: { id: string; name: string }[] };

export default function GenerateInvoicesPage() {
  const [classes, setClasses] = useState<ClassLevel[]>([]);
  const [sectionId, setSectionId] = useState("");
  const [title, setTitle] = useState("Term 1 Fee");
  const [dueDate, setDueDate] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/classes").then((r) => r.json()).then(setClasses).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "bulk", sectionId, title, dueDate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setMessage(`${data.count} invoices generate ho gaye.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">Generate Fee Invoices</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-md space-y-4">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {message && <p className="text-green-700 text-sm">{message}</p>}
        <div>
          <label className="block text-sm mb-1">Class / Section</label>
          <select
            required
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select</option>
            {classes.map((c) =>
              c.sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {c.name} - {s.name}
                </option>
              ))
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Invoice Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Due Date</label>
          <input
            required
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          disabled={loading}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Invoices for Section"}
        </button>
        <p className="text-xs text-gray-500">
          Section ke us class ke fee structure (Fee Structure Setup page) ke hisaab se
          har active student ke liye invoice ban jayega.
        </p>
      </form>
    </div>
  );
}
