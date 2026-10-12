"use client";

import { useEffect, useState } from "react";

type ClassLevel = { id: string; name: string; sections: { id: string; name: string }[] };

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassLevel[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [newSectionName, setNewSectionName] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/classes")
      .then((r) => r.json())
      .then(setClasses)
      .catch(() => {});
  }

  useEffect(load, []);

  async function addClass(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newClassName }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setNewClassName("");
    load();
  }

  async function addSection(classLevelId: string) {
    const name = newSectionName[classLevelId];
    if (!name) return;
    const res = await fetch("/api/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, classLevelId }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setNewSectionName((s) => ({ ...s, [classLevelId]: "" }));
    load();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">Classes &amp; Sections</h1>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <form onSubmit={addClass} className="flex gap-2 mb-6 max-w-md">
        <input
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          placeholder="e.g. Class 10"
          className="border rounded px-3 py-2 flex-1"
        />
        <button className="bg-blue-600 text-white rounded px-4 py-2 text-sm">
          Add Class
        </button>
      </form>

      <div className="space-y-4 max-w-2xl">
        {classes.map((c) => (
          <div key={c.id} className="bg-white rounded-lg shadow p-4">
            <p className="font-semibold mb-2">{c.name}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {c.sections.map((s) => (
                <span
                  key={s.id}
                  className="bg-gray-100 rounded px-3 py-1 text-sm"
                >
                  {s.name}
                </span>
              ))}
              {c.sections.length === 0 && (
                <span className="text-gray-400 text-sm">Koi section nahi</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={newSectionName[c.id] || ""}
                onChange={(e) =>
                  setNewSectionName((s) => ({ ...s, [c.id]: e.target.value }))
                }
                placeholder="Section name e.g. A"
                className="border rounded px-2 py-1 text-sm"
              />
              <button
                onClick={() => addSection(c.id)}
                className="bg-gray-700 text-white rounded px-3 py-1 text-sm"
              >
                + Section
              </button>
            </div>
          </div>
        ))}
        {classes.length === 0 && (
          <p className="text-gray-400">Koi class nahi bani abhi</p>
        )}
      </div>
    </div>
  );
}
