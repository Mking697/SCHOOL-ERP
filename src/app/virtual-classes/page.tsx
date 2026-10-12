"use client";

import { useEffect, useState } from "react";

type ClassLevel = { id: string; name: string; sections: { id: string; name: string }[] };
type Subject = { id: string; name: string };
type VClass = {
  id: string;
  title: string;
  meetingLink: string;
  scheduledAt: string;
  subject: Subject;
  section: { name: string; classLevel: ClassLevel };
};

export default function VirtualClassesPage() {
  const [classes, setClasses] = useState<ClassLevel[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [vclasses, setVclasses] = useState<VClass[]>([]);
  const [form, setForm] = useState({
    sectionId: "",
    subjectId: "",
    title: "",
    meetingLink: "",
    scheduledAt: "",
  });
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/virtual-classes").then((r) => r.json()).then(setVclasses).catch(() => {});
  }

  useEffect(() => {
    fetch("/api/classes").then((r) => r.json()).then(setClasses).catch(() => {});
    fetch("/api/subjects").then((r) => r.json()).then(setSubjects).catch(() => {});
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/virtual-classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setForm({ sectionId: "", subjectId: "", title: "", meetingLink: "", scheduledAt: "" });
    load();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">E-Learning / Virtual Classroom</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mb-6 max-w-xl space-y-2">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <select
          required
          value={form.sectionId}
          onChange={(e) => setForm((f) => ({ ...f, sectionId: e.target.value }))}
          className="border rounded px-3 py-2 text-sm w-full"
        >
          <option value="">Select Class/Section</option>
          {classes.map((c) =>
            c.sections.map((s) => (
              <option key={s.id} value={s.id}>
                {c.name} - {s.name}
              </option>
            ))
          )}
        </select>
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
          placeholder="Class title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="border rounded px-3 py-2 text-sm w-full"
        />
        <input
          required
          placeholder="Meeting link (Zoom/Google Meet URL)"
          value={form.meetingLink}
          onChange={(e) => setForm((f) => ({ ...f, meetingLink: e.target.value }))}
          className="border rounded px-3 py-2 text-sm w-full"
        />
        <input
          required
          type="datetime-local"
          value={form.scheduledAt}
          onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
          className="border rounded px-3 py-2 text-sm w-full"
        />
        <button className="bg-blue-600 text-white rounded px-4 py-2 text-sm">Schedule Class</button>
      </form>

      <div className="space-y-3 max-w-xl">
        {vclasses.map((v) => (
          <div key={v.id} className="bg-white rounded-lg shadow p-4">
            <p className="font-semibold">{v.title}</p>
            <p className="text-sm text-gray-600">
              {v.section.classLevel.name} - {v.section.name} · {v.subject.name}
            </p>
            <p className="text-sm text-gray-600">{new Date(v.scheduledAt).toLocaleString()}</p>
            <a
              href={v.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 text-sm"
            >
              Join Link
            </a>
          </div>
        ))}
        {vclasses.length === 0 && <p className="text-gray-400">Koi class schedule nahi hui</p>}
      </div>
    </div>
  );
}
