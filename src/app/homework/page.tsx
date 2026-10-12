"use client";

import { useEffect, useState } from "react";

type ClassLevel = { id: string; name: string; sections: { id: string; name: string }[] };
type Subject = { id: string; name: string };
type HW = {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  subject: Subject;
  section: { name: string; classLevel: ClassLevel };
};

export default function HomeworkPage() {
  const [classes, setClasses] = useState<ClassLevel[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sectionId, setSectionId] = useState("");
  const [homework, setHomework] = useState<HW[]>([]);
  const [form, setForm] = useState({ subjectId: "", title: "", description: "", dueDate: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/classes").then((r) => r.json()).then(setClasses).catch(() => {});
    fetch("/api/subjects").then((r) => r.json()).then(setSubjects).catch(() => {});
  }, []);

  function load(sid: string) {
    fetch(`/api/homework?sectionId=${sid}`).then((r) => r.json()).then(setHomework).catch(() => {});
  }

  useEffect(() => {
    if (sectionId) load(sectionId);
    else setHomework([]);
  }, [sectionId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/homework", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sectionId }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setForm({ subjectId: "", title: "", description: "", dueDate: "" });
    load(sectionId);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">Homework / Assignments</h1>

      <div className="mb-4">
        <label className="block text-sm mb-1">Class / Section</label>
        <select
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          className="border rounded px-3 py-2"
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

      {sectionId && (
        <>
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mb-6 max-w-xl space-y-2">
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <select
              required
              value={form.subjectId}
              onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}
              className="border rounded px-3 py-2 text-sm w-full"
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input
              required
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="border rounded px-3 py-2 text-sm w-full"
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="border rounded px-3 py-2 text-sm w-full"
            />
            <input
              required
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              className="border rounded px-3 py-2 text-sm w-full"
            />
            <button className="bg-blue-600 text-white rounded px-4 py-2 text-sm">Assign Homework</button>
          </form>

          <div className="bg-white rounded-lg shadow max-w-2xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {homework.map((h) => (
                  <tr key={h.id} className="border-t">
                    <td className="p-3">{h.subject.name}</td>
                    <td className="p-3">{h.title}</td>
                    <td className="p-3">{new Date(h.dueDate).toLocaleDateString()}</td>
                  </tr>
                ))}
                {homework.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-gray-400">
                      Koi homework nahi hai
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
