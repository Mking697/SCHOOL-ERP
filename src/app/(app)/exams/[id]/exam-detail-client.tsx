"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Save, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, Thead, Th, Td, Tr } from "@/components/ui/table";

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

  if (!exam) return <div className="p-8 text-sm text-slate-500">Loading...</div>;

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
    <>
      <PageHeader title={exam.title} description={exam.classLevel.name} />

      <div className="flex gap-2 mb-4 flex-wrap">
        {exam.subjects.map((es) => (
          <Button
            key={es.id}
            size="sm"
            variant={activeSubjectId === es.id ? "primary" : "secondary"}
            onClick={() => setActiveSubjectId(es.id)}
          >
            {es.subject.name} (/{es.maxMarks})
          </Button>
        ))}
      </div>

      {message && <p className="text-sm text-indigo-700 mb-4">{message}</p>}

      {activeSubject && (
        <Card className="max-w-xl overflow-hidden">
          <Table>
            <Thead>
              <Tr>
                <Th>Adm No</Th>
                <Th>Name</Th>
                <Th>Marks (/{activeSubject.maxMarks})</Th>
              </Tr>
            </Thead>
            <tbody>
              {allStudents.map((s) => (
                <Tr key={s.id}>
                  <Td>{s.admissionNo}</Td>
                  <Td>
                    {s.firstName} {s.lastName}
                  </Td>
                  <Td>
                    <Input
                      type="number"
                      max={activeSubject.maxMarks}
                      min={0}
                      value={marksDraft[s.id] ?? ""}
                      onChange={(e) =>
                        setMarksDraft((d) => ({ ...d, [s.id]: e.target.value }))
                      }
                      className="w-20 py-1"
                    />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <div className="p-3 border-t border-slate-100">
            <Button onClick={saveMarks} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Marks"}
            </Button>
          </div>
        </Card>
      )}

      <div className="mt-6">
        <p className="text-sm font-medium text-slate-700 mb-2">Report Cards</p>
        <div className="flex flex-wrap gap-2">
          {allStudents.map((s) => (
            <Link key={s.id} href={`/exams/${exam.id}/report-card/${s.id}`}>
              <Button variant="secondary" size="sm">
                <FileText className="h-3.5 w-3.5" />
                {s.firstName} {s.lastName}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
