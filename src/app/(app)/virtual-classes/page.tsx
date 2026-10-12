"use client";

import { useEffect, useState } from "react";
import { Video } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";

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
    <div>
      <PageHeader
        title="E-Learning / Virtual Classroom"
        description="Schedule and manage online classes for students."
      />

      <Card className="max-w-xl mb-6">
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-rose-600 text-sm">{error}</p>}
            <div>
              <Label>Class / Section</Label>
              <Select
                required
                value={form.sectionId}
                onChange={(e) => setForm((f) => ({ ...f, sectionId: e.target.value }))}
              >
                <option value="">Select Class/Section</option>
                {classes.map((c) =>
                  c.sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {c.name} - {s.name}
                    </option>
                  ))
                )}
              </Select>
            </div>
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
              <Label>Class title</Label>
              <Input
                required
                placeholder="Class title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <Label>Meeting link</Label>
              <Input
                required
                placeholder="Meeting link (Zoom/Google Meet URL)"
                value={form.meetingLink}
                onChange={(e) => setForm((f) => ({ ...f, meetingLink: e.target.value }))}
              />
            </div>
            <div>
              <Label>Scheduled at</Label>
              <Input
                required
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
              />
            </div>
            <Button type="submit">
              <Video className="h-4 w-4" /> Schedule Class
            </Button>
          </form>
        </CardBody>
      </Card>

      <div className="space-y-3 max-w-xl">
        {vclasses.map((v) => (
          <Card key={v.id}>
            <CardBody>
              <p className="font-semibold text-slate-900">{v.title}</p>
              <p className="text-sm text-slate-600">
                {v.section.classLevel.name} - {v.section.name} · {v.subject.name}
              </p>
              <p className="text-sm text-slate-600">{new Date(v.scheduledAt).toLocaleString()}</p>
              <a
                href={v.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 text-sm font-medium"
              >
                Join Link
              </a>
            </CardBody>
          </Card>
        ))}
        {vclasses.length === 0 && <p className="text-slate-400 text-sm">Koi class schedule nahi hui</p>}
      </div>
    </div>
  );
}
