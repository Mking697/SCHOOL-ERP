"use client";

import { useEffect, useState } from "react";

type ClassLevel = { id: string; name: string; sections: { id: string; name: string }[] };
type StudentRow = {
  id: string;
  firstName: string;
  lastName: string;
  admissionNo: string;
  status: string | null;
};

const STATUSES = ["PRESENT", "ABSENT", "LATE", "HALF_DAY"];

export default function AttendancePage() {
  const [classes, setClasses] = useState<ClassLevel[]>([]);
  const [sectionId, setSectionId] = useState("");
  const [date, setDate] = useState("");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setDate(new Date().toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    fetch("/api/classes")
      .then((r) => r.json())
      .then(setClasses)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!sectionId || !date) {
      setStudents([]);
      return;
    }
    fetch(`/api/attendance?sectionId=${sectionId}&date=${date}`)
      .then((r) => r.json())
      .then(setStudents)
      .catch(() => {});
  }, [sectionId, date]);

  function setStatus(studentId: string, status: string) {
    setStudents((rows) =>
      rows.map((r) => (r.id === studentId ? { ...r, status } : r))
    );
  }

  function markAll(status: string) {
    setStudents((rows) => rows.map((r) => ({ ...r, status })));
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          entries: students
            .filter((s) => s.status)
            .map((s) => ({ studentId: s.id, status: s.status })),
        }),
      });
      if (res.ok) {
        setMessage("Attendance saved.");
      } else {
        setMessage("Save fail hui.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">Attendance</h1>

      <div className="flex gap-4 mb-6 items-end">
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
        <div>
          <label className="block text-sm mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
        {students.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => markAll("PRESENT")}
              className="bg-green-600 text-white rounded px-3 py-2 text-sm"
            >
              Mark All Present
            </button>
          </div>
        )}
      </div>

      {message && <p className="text-sm text-blue-700 mb-4">{message}</p>}

      {students.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden max-w-2xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Adm No</th>
                <th className="p-3">Name</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-3">{s.admissionNo}</td>
                  <td className="p-3">
                    {s.firstName} {s.lastName}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {STATUSES.map((st) => (
                        <button
                          key={st}
                          onClick={() => setStatus(s.id, st)}
                          className={`text-xs rounded px-2 py-1 border ${
                            s.status === st
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-3 border-t">
            <button
              onClick={save}
              disabled={saving}
              className="bg-blue-600 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        </div>
      )}

      {sectionId && students.length === 0 && (
        <p className="text-gray-400">Is section mein koi active student nahi hai</p>
      )}
    </div>
  );
}
