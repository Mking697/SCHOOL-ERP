"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";
import { Table, Thead, Th, Td, Tr } from "@/components/ui/table";
import { CheckCircle2 } from "lucide-react";

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
    <div>
      <PageHeader title="Attendance" description="Mark daily attendance for a class section" />

      <div className="flex gap-4 mb-6 items-end">
        <div>
          <Label>Class / Section</Label>
          <Select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="w-auto"
          >
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
        <div>
          <Label>Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-auto"
          />
        </div>
        {students.length > 0 && (
          <Button variant="success" onClick={() => markAll("PRESENT")}>
            <CheckCircle2 className="w-4 h-4" />
            Mark All Present
          </Button>
        )}
      </div>

      {message && <p className="text-sm text-indigo-700 mb-4">{message}</p>}

      {students.length > 0 && (
        <Card className="max-w-2xl">
          <Table>
            <Thead>
              <tr>
                <Th>Adm No</Th>
                <Th>Name</Th>
                <Th>Status</Th>
              </tr>
            </Thead>
            <tbody>
              {students.map((s) => (
                <Tr key={s.id}>
                  <Td>{s.admissionNo}</Td>
                  <Td>
                    {s.firstName} {s.lastName}
                  </Td>
                  <Td>
                    <div className="flex gap-1">
                      {STATUSES.map((st) => (
                        <Button
                          key={st}
                          size="sm"
                          variant={s.status === st ? "primary" : "secondary"}
                          onClick={() => setStatus(s.id, st)}
                        >
                          {st}
                        </Button>
                      ))}
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <CardBody className="border-t border-slate-100 py-3">
            <Button onClick={save} disabled={saving} variant="primary">
              {saving ? "Saving..." : "Save Attendance"}
            </Button>
          </CardBody>
        </Card>
      )}

      {sectionId && students.length === 0 && (
        <p className="text-slate-400">Is section mein koi active student nahi hai</p>
      )}
    </div>
  );
}
