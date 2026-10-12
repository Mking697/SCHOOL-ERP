"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Student = { id: string; firstName: string; lastName: string; admissionNo: string };
type Section = { id: string; name: string; students: Student[] };
type Subject = { id: string; name: string };
type ExamSubject = {
  id: string;
  subject: Subject;
  maxMarks: number;
  marks: { studentId: string; marksObtained: string }[];
};
type Exam = {
  id: string;
  title: string;
  classLevel: { id: string; name: string; sections: Section[] };
  subjects: ExamSubject[];
};

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [activeSubjectId, setActiveSubjectId] = useState("");
  const [marksDraft, setMarksDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch(`/api/exams/${id}`)
      .then((r) => r.json())
      .then((data: Exam) => {
        setExam(data);
        if (!activeSubjectId && data.subjects.length > 0) {
          setActiveSubjectId(data.subjects[0].id);
        }
      })
      .catch(() => {});
  }, [id, activeSubjectId]);

  useEffect(load, [load]);

  useEffect(() => {
    if (!exam || !activeSubjectId) return;
    const es = exam.subjects.find((s) => s.id === activeSubjectId);
    if (!es) return;
    const draft: Record<string, string> = {};
    es.marks.forEach((m) => {
      draft[m.studentId] = String(m.marksObtained);
    });
    setMarksDraft(draft);
  }, [exam, activeSubjectId]);

  if (!exam) return <div className="p-8">Loading...</div>;

  const allStudents = exam.classLevel.sections.flatMap((s) => s.students);
  const activeSubject = exam.subjects.find((s) => s.id === activeSubjectId);

  async function saveMarks() {
    if (!activeSubjectId) return;
    setSaving(true);
    setMessage(null);
    try {
      const entries = Object.entries(marksDraft)
        .filter(([, v]) => v !== "")
        .map(([studentId, marksObtained]) => ({ studentId, marksObtained: Number(marksObtained) }));
      const res = await fetch(`/api/exam-subjects/${activeSubjectId}/marks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      if (res.ok) {
        setMessage("Marks saved.");
        load();
      } else {
        setMessage("Save fail hui.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-1">{exam.title}</h1>
      <p className="text-gray-600 mb-6">{exam.classLevel.name}</p>

      <div className="flex gap-2 mb-4">
        {exam.subjects.map((es) => (
          <button
            key={es.id}
            onClick={() => setActiveSubjectId(es.id)}
            className={`px-3 py-1 rounded text-sm border ${
              activeSubjectId === es.id
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white border-gray-300"
            }`}
          >
            {es.subject.name} (/{es.maxMarks})
          </button>
        ))}
      </div>

      {message && <p className="text-sm text-blue-700 mb-4">{message}</p>}

      {activeSubject && (
        <div className="bg-white rounded-lg shadow max-w-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Adm No</th>
                <th className="p-3">Name</th>
                <th className="p-3">Marks (/{activeSubject.maxMarks})</th>
              </tr>
            </thead>
            <tbody>
              {allStudents.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-3">{s.admissionNo}</td>
                  <td className="p-3">
                    {s.firstName} {s.lastName}
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      max={activeSubject.maxMarks}
                      min={0}
                      value={marksDraft[s.id] ?? ""}
                      onChange={(e) =>
                        setMarksDraft((d) => ({ ...d, [s.id]: e.target.value }))
                      }
                      className="border rounded px-2 py-1 text-sm w-20"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-3 border-t">
            <button
              onClick={saveMarks}
              disabled={saving}
              className="bg-blue-600 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Marks"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <p className="font-medium mb-2">Report Cards</p>
        <div className="flex flex-wrap gap-2">
          {allStudents.map((s) => (
            <Link
              key={s.id}
              href={`/exams/${exam.id}/report-card/${s.id}`}
              className="bg-gray-700 text-white rounded px-3 py-1 text-xs"
            >
              {s.firstName} {s.lastName}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
