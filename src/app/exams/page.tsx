"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ClassLevel = { id: string; name: string };
type Subject = { id: string; name: string };
type Exam = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  classLevel: ClassLevel;
  subjects: { subject: Subject; maxMarks: number }[];
};

export default function ExamsPage() {
  const [classes, setClasses] = useState<ClassLevel[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    classLevelId: "",
    startDate: "",
    endDate: "",
  });
  const [selectedSubjects, setSelectedSubjects] = useState<Record<string, number>>({});

  function load() {
    fetch("/api/exams").then((r) => r.json()).then(setExams).catch(() => {});
  }

  useEffect(() => {
    fetch("/api/classes")
      .then((r) => r.json())
      .then((data) => setClasses(data.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name }))))
      .catch(() => {});
    fetch("/api/subjects").then((r) => r.json()).then(setSubjects).catch(() => {});
    load();
  }, []);

  function toggleSubject(id: string) {
    setSelectedSubjects((s) => {
      const copy = { ...s };
      if (id in copy) delete copy[id];
      else copy[id] = 100;
      return copy;
    });
  }

  function setMaxMarks(id: string, val: number) {
    setSelectedSubjects((s) => ({ ...s, [id]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const subjectsPayload = Object.entries(selectedSubjects).map(([subjectId, maxMarks]) => ({
      subjectId,
      maxMarks,
    }));
    if (subjectsPayload.length === 0) {
      setError("Kam se kam ek subject select karo");
      return;
    }
    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, subjects: subjectsPayload }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setForm({ title: "", classLevelId: "", startDate: "", endDate: "" });
    setSelectedSubjects({});
    load();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">Exams</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mb-6 max-w-xl space-y-3">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input
          required
          placeholder="Exam title e.g. Term 1 Exam"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="border rounded px-3 py-2 text-sm w-full"
        />
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
        <div className="flex gap-2">
          <input
            required
            type="date"
            value={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            className="border rounded px-3 py-2 text-sm flex-1"
          />
          <input
            required
            type="date"
            value={form.endDate}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            className="border rounded px-3 py-2 text-sm flex-1"
          />
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Subjects (max marks)</p>
          <div className="space-y-1">
            {subjects.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={s.id in selectedSubjects}
                  onChange={() => toggleSubject(s.id)}
                />
                <span className="text-sm w-32">{s.name}</span>
                {s.id in selectedSubjects && (
                  <input
                    type="number"
                    value={selectedSubjects[s.id]}
                    onChange={(e) => setMaxMarks(s.id, Number(e.target.value))}
                    className="border rounded px-2 py-1 text-xs w-20"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <button className="bg-blue-600 text-white rounded px-4 py-2 text-sm">Create Exam</button>
      </form>

      <div className="bg-white rounded-lg shadow max-w-2xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Class</th>
              <th className="p-3">Dates</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {exams.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-3">{e.title}</td>
                <td className="p-3">{e.classLevel.name}</td>
                <td className="p-3">
                  {new Date(e.startDate).toLocaleDateString()} -{" "}
                  {new Date(e.endDate).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <Link href={`/exams/${e.id}`} className="text-blue-600">
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
            {exams.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-400">
                  Koi exam nahi bana
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
