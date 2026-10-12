"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ActivateLicenseForm() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: key }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error);
        return;
      }
      setKey("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 max-w-md space-y-2">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <label className="block text-sm mb-1">License Key</label>
      <textarea
        required
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="Paste the license key provided by Essor Automations"
        className="border rounded px-3 py-2 text-xs w-full font-mono"
        rows={3}
      />
      <button
        disabled={loading}
        className="bg-blue-600 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
      >
        {loading ? "Activating..." : "Activate License"}
      </button>
    </form>
  );
}
