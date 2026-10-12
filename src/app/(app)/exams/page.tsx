"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";

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
    <>
      <PageHeader title="Exams" description="Create exams and manage subject-wise marks entry" />

      <Card className="mb-6 max-w-xl">
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">Create Exam</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-rose-600 text-sm">{error}</p>}
            <div>
              <Label>Exam Title</Label>
              <Input
                required
                placeholder="Exam title e.g. Term 1 Exam"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <Label>Class</Label>
              <Select
                required
                value={form.classLevelId}
                onChange={(e) => setForm((f) => ({ ...f, classLevelId: e.target.value }))}
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label>Start Date</Label>
                <Input
                  required
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="flex-1">
                <Label>End Date</Label>
                <Input
                  required
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Subjects (max marks)</Label>
              <div className="space-y-1.5">
                {subjects.map((s) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={s.id in selectedSubjects}
                      onChange={() => toggleSubject(s.id)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm w-32 text-slate-700">{s.name}</span>
                    {s.id in selectedSubjects && (
                      <Input
                        type="number"
                        value={selectedSubjects[s.id]}
                        onChange={(e) => setMaxMarks(s.id, Number(e.target.value))}
                        className="w-20 text-xs py-1"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit">
              <PlusCircle className="h-4 w-4" />
              Create Exam
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card className="max-w-2xl">
        <Table>
          <Thead>
            <Tr>
              <Th>Title</Th>
              <Th>Class</Th>
              <Th>Dates</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <tbody>
            {exams.map((e) => (
              <Tr key={e.id}>
                <Td>{e.title}</Td>
                <Td>{e.classLevel.name}</Td>
                <Td>
                  {new Date(e.startDate).toLocaleDateString()} -{" "}
                  {new Date(e.endDate).toLocaleDateString()}
                </Td>
                <Td>
                  <Link href={`/exams/${e.id}`}>
                    <Button variant="ghost" size="sm">
                      Manage
                    </Button>
                  </Link>
                </Td>
              </Tr>
            ))}
            {exams.length === 0 && (
              <EmptyRow colSpan={4}>
                <div className="flex flex-col items-center gap-1">
                  <ClipboardList className="h-5 w-5 text-slate-300" />
                  Koi exam nahi bana
                </div>
              </EmptyRow>
            )}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
