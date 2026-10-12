"use client";

import { useEffect, useState } from "react";
import { PlusCircle, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea, Label } from "@/components/ui/input";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";

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
    <>
      <PageHeader title="Homework / Assignments" description="Assign and track homework for a class section" />

      <div className="mb-4 max-w-xl">
        <Label>Class / Section</Label>
        <Select value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
          <option value="">Select</option>
          {classes.map((c) =>
            c.sections.map((s) => (
              <option key={s.id} value={s.id}>
                {c.name} - {s.name}
              </option>
            ))
          )}
        </Select>
      </div>

      {sectionId && (
        <>
          <Card className="mb-6 max-w-xl">
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900">Assign New Homework</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-3">
                {error && <p className="text-rose-600 text-sm">{error}</p>}
                <div>
                  <Label>Subject</Label>
                  <Select
                    required
                    value={form.subjectId}
                    onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    required
                    placeholder="Title"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    required
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  />
                </div>
                <Button type="submit">
                  <PlusCircle className="h-4 w-4" />
                  Assign Homework
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card className="max-w-2xl">
            <Table>
              <Thead>
                <Tr>
                  <Th>Subject</Th>
                  <Th>Title</Th>
                  <Th>Due Date</Th>
                </Tr>
              </Thead>
              <tbody>
                {homework.map((h) => (
                  <Tr key={h.id}>
                    <Td>{h.subject.name}</Td>
                    <Td>{h.title}</Td>
                    <Td>{new Date(h.dueDate).toLocaleDateString()}</Td>
                  </Tr>
                ))}
                {homework.length === 0 && (
                  <EmptyRow colSpan={3}>
                    <div className="flex flex-col items-center gap-1">
                      <BookOpen className="h-5 w-5 text-slate-300" />
                      Koi homework nahi hai
                    </div>
                  </EmptyRow>
                )}
              </tbody>
            </Table>
          </Card>
        </>
      )}
    </>
  );
}
