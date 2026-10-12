"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ClassLevel = { id: string; name: string; sections: { id: string; name: string }[] };

export default function NewStudentPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassLevel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    sectionId: "",
    guardianName: "",
    guardianPhone: "",
    address: "",
  });

  useEffect(() => {
    fetch("/api/classes")
      .then((r) => r.json())
      .then(setClasses)
      .catch(() => {});
  }, []);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Admission fail hui");
        return;
      }
      router.push(`/students/${data.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">New Admission</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-6 max-w-2xl space-y-4"
      >
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">First Name *</label>
            <input
              required
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Last Name *</label>
            <input
              required
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Date of Birth</label>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => update("dob", e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm mb-1">Class / Section</label>
            <select
              value={form.sectionId}
              onChange={(e) => update("sectionId", e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Not assigned</option>
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
            <label className="block text-sm mb-1">Guardian Name</label>
            <input
              value={form.guardianName}
              onChange={(e) => update("guardianName", e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Guardian Phone</label>
            <input
              value={form.guardianPhone}
              onChange={(e) => update("guardianPhone", e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm mb-1">Address</label>
            <textarea
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Admit Student"}
        </button>
      </form>
    </div>
  );
}
