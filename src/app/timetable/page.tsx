"use client";

import { useEffect, useState } from "react";

type ClassLevel = { id: string; name: string; sections: { id: string; name: string }[] };
type Subject = { id: string; name: string };
type Entry = {
  id: string;
  dayOfWeek: number;
  periodNumber: number;
  subjectId: string | null;
  subject: Subject | null;
  teacherName: string | null;
  startTime: string | null;
  endTime: string | null;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
const WORKING_DAYS = [1, 2, 3, 4, 5, 6]; // Mon-Sat

export default function TimetablePage() {
  const [classes, setClasses] = useState<ClassLevel[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sectionId, setSectionId] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [newSubjectName, setNewSubjectName] = useState("");

  useEffect(() => {
    fetch("/api/classes").then((r) => r.json()).then(setClasses).catch(() => {});
    fetch("/api/subjects").then((r) => r.json()).then(setSubjects).catch(() => {});
  }, []);

  function loadEntries(sid: string) {
    fetch(`/api/timetable?sectionId=${sid}`)
      .then((r) => r.json())
      .then(setEntries)
      .catch(() => {});
  }

  useEffect(() => {
    if (sectionId) loadEntries(sectionId);
    else setEntries([]);
  }, [sectionId]);

  async function addSubject(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubjectName) return;
    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSubjectName }),
    });
    if (res.ok) {
      setNewSubjectName("");
      fetch("/api/subjects").then((r) => r.json()).then(setSubjects);
    }
  }

  async function setCell(dayOfWeek: number, periodNumber: number, subjectId: string) {
    if (!sectionId) return;
    await fetch("/api/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId, dayOfWeek, periodNumber, subjectId: subjectId || null }),
    });
    loadEntries(sectionId);
  }

  function cellValue(day: number, period: number) {
    return entries.find((e) => e.dayOfWeek === day && e.periodNumber === period);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">Timetable</h1>

      <div className="flex gap-4 mb-4 items-end">
        <div>
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
        <form onSubmit={addSubject} className="flex gap-2">
          <input
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            placeholder="New subject e.g. Maths"
            className="border rounded px-3 py-2 text-sm"
          />
          <button className="bg-gray-700 text-white rounded px-3 py-2 text-sm">
            + Subject
          </button>
        </form>
      </div>

      {sectionId && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="text-sm border-collapse">
            <thead>
              <tr>
                <th className="p-2 border bg-gray-100">Period</th>
                {WORKING_DAYS.map((d) => (
                  <th key={d} className="p-2 border bg-gray-100">
                    {DAYS[d]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((p) => (
                <tr key={p}>
                  <td className="p-2 border font-medium text-center">{p}</td>
                  {WORKING_DAYS.map((d) => {
                    const cell = cellValue(d, p);
                    return (
                      <td key={d} className="p-1 border">
                        <select
                          value={cell?.subjectId || ""}
                          onChange={(e) => setCell(d, p, e.target.value)}
                          className="text-xs border-0 w-full"
                        >
                          <option value="">-</option>
                          {subjects.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!sectionId && <p className="text-gray-400">Pehle class/section select karo</p>}
    </div>
  );
}
