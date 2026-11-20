"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";
import { Plus, Settings } from "lucide-react";
import ExportButtons from "@/components/export-buttons";
import type { ExportColumn } from "@/lib/export";

type ClassLevel = { id: string; name: string; sections: { id: string; name: string }[] };
type Subject = { id: string; name: string };
type Staff = { id: string; name: string; designation: string };
type PeriodDef = {
  id: string;
  periodNumber: number;
  label: string;
  startTime: string;
  endTime: string;
  isBreak: boolean;
};
type Entry = {
  id: string;
  dayOfWeek: number;
  periodNumber: number;
  subjectId: string | null;
  subject: Subject | null;
  teacherId: string | null;
  teacher: Staff | null;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WORKING_DAYS = [1, 2, 3, 4, 5, 6]; // Mon-Sat

const DEFAULT_PERIODS: Omit<PeriodDef, "id">[] = [
  { periodNumber: 1, label: "Period 1", startTime: "08:00", endTime: "08:40", isBreak: false },
  { periodNumber: 2, label: "Period 2", startTime: "08:40", endTime: "09:20", isBreak: false },
  { periodNumber: 3, label: "Period 3", startTime: "09:20", endTime: "10:00", isBreak: false },
  { periodNumber: 4, label: "Period 4", startTime: "10:00", endTime: "10:40", isBreak: false },
  { periodNumber: 9, label: "Lunch Break", startTime: "10:40", endTime: "11:20", isBreak: true },
  { periodNumber: 5, label: "Period 5", startTime: "11:20", endTime: "12:00", isBreak: false },
  { periodNumber: 6, label: "Period 6", startTime: "12:00", endTime: "12:40", isBreak: false },
  { periodNumber: 7, label: "Period 7", startTime: "12:40", endTime: "13:20", isBreak: false },
  { periodNumber: 8, label: "Period 8", startTime: "13:20", endTime: "14:00", isBreak: false },
];

export default function TimetablePage() {
  const [role, setRole] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassLevel[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [periods, setPeriods] = useState<PeriodDef[]>([]);
  const [sectionId, setSectionId] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPeriodSetup, setShowPeriodSetup] = useState(false);

  const canEdit = role === "SUPER_ADMIN" || role === "PRINCIPAL" || role === "HR";

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setRole(d.role)).catch(() => {});
    fetch("/api/classes").then((r) => r.json()).then(setClasses).catch(() => {});
    fetch("/api/subjects").then((r) => r.json()).then(setSubjects).catch(() => {});
    fetch("/api/periods").then((r) => r.json()).then(setPeriods).catch(() => {});
  }, []);

  useEffect(() => {
    // Staff list is an HR-only API; only fetch it when the viewer can edit
    // (and therefore needs the teacher dropdown) -- a Teacher viewing
    // read-only would otherwise get a harmless but noisy 403 in the console.
    if (canEdit) {
      fetch("/api/staff").then((r) => r.json()).then(setStaffList).catch(() => {});
    }
  }, [canEdit]);

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

  async function setupDefaultPeriods() {
    for (const p of DEFAULT_PERIODS) {
      await fetch("/api/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
    }
    fetch("/api/periods").then((r) => r.json()).then(setPeriods);
  }

  async function setCell(
    dayOfWeek: number,
    periodNumber: number,
    field: "subjectId" | "teacherId",
    value: string
  ) {
    if (!sectionId) return;
    setError(null);
    const current = cellValue(dayOfWeek, periodNumber);
    const body = {
      sectionId,
      dayOfWeek,
      periodNumber,
      subjectId: field === "subjectId" ? value || null : current?.subjectId || null,
      teacherId: field === "teacherId" ? value || null : current?.teacherId || null,
    };
    const res = await fetch("/api/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    loadEntries(sectionId);
  }

  function cellValue(day: number, period: number) {
    return entries.find((e) => e.dayOfWeek === day && e.periodNumber === period);
  }

  const teachingPeriods = periods.filter((p) => !p.isBreak);
  const gridRows = periods.length > 0 ? periods : DEFAULT_PERIODS.map((p, i) => ({ ...p, id: String(i) }));

  type ExportRow = { day: string; period: string; time: string; subject: string; teacher: string };
  const exportRows: ExportRow[] = gridRows
    .filter((p) => !p.isBreak)
    .flatMap((p) =>
      WORKING_DAYS.map((d) => {
        const cell = cellValue(d, p.periodNumber);
        return {
          day: DAYS[d],
          period: p.label,
          time: `${p.startTime}-${p.endTime}`,
          subject: cell?.subject?.name || "-",
          teacher: cell?.teacher?.name || "-",
        };
      })
    );
  const exportColumns: ExportColumn<ExportRow>[] = [
    { header: "Day", value: (r) => r.day },
    { header: "Period", value: (r) => r.period },
    { header: "Time", value: (r) => r.time },
    { header: "Subject", value: (r) => r.subject },
    { header: "Teacher", value: (r) => r.teacher },
  ];

  return (
    <div>
      <PageHeader
        title="Timetable"
        description={
          canEdit
            ? "Build the weekly timetable for a class section -- assign subject + teacher per period"
            : "Class/section ka weekly schedule (view-only)"
        }
      />

      {canEdit && periods.length === 0 && (
        <Card className="max-w-xl mb-4">
          <div className="p-4">
            <p className="text-sm text-slate-600 mb-2">
              Abhi koi period/bell schedule set nahi hai. Default 8 periods + lunch break se shuru karo
              (baad me times edit kar sakte ho).
            </p>
            <Button variant="secondary" onClick={setupDefaultPeriods}>
              <Settings className="w-4 h-4" />
              Setup Default 8 Periods + Lunch
            </Button>
          </div>
        </Card>
      )}

      <div className="flex gap-4 mb-4 items-end flex-wrap">
        <div>
          <Label>Class / Section</Label>
          <Select value={sectionId} onChange={(e) => setSectionId(e.target.value)} className="w-auto">
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
        {canEdit && (
          <form onSubmit={addSubject} className="flex gap-2">
            <Input
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="New subject e.g. Maths"
              className="text-sm w-auto"
            />
            <Button variant="secondary">
              <Plus className="w-4 h-4" />
              Subject
            </Button>
          </form>
        )}
        {canEdit && periods.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setShowPeriodSetup((v) => !v)}>
            <Settings className="w-3.5 h-3.5" />
            Period Times
          </Button>
        )}
        {sectionId && (
          <ExportButtons data={exportRows} columns={exportColumns} filename="timetable" sheetName="Timetable" />
        )}
      </div>

      {error && <p className="text-rose-600 text-sm mb-3">{error}</p>}

      {showPeriodSetup && canEdit && (
        <Card className="max-w-2xl mb-4">
          <div className="p-4 space-y-2">
            {teachingPeriods.map((p) => (
              <p key={p.id} className="text-sm text-slate-600">
                {p.label}: {p.startTime} - {p.endTime}
              </p>
            ))}
            {periods.filter((p) => p.isBreak).map((p) => (
              <p key={p.id} className="text-sm text-amber-600">
                {p.label}: {p.startTime} - {p.endTime}
              </p>
            ))}
            <p className="text-xs text-slate-400">
              Times badalne ke liye /api/periods POST karo (agle round me inline edit form add karenge).
            </p>
          </div>
        </Card>
      )}

      {sectionId && (
        <Card>
          <div className="overflow-x-auto">
            <table className="text-sm border-collapse w-full">
              <thead>
                <tr>
                  <th className="p-2 border border-slate-200 bg-slate-50 text-slate-600 font-semibold">Period</th>
                  {WORKING_DAYS.map((d) => (
                    <th key={d} className="p-2 border border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                      {DAYS[d]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gridRows.map((p) => (
                  <tr key={p.id} className={p.isBreak ? "bg-amber-50" : ""}>
                    <td className="p-2 border border-slate-200 font-medium text-center text-slate-700">
                      {p.label}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {p.startTime}-{p.endTime}
                      </span>
                    </td>
                    {p.isBreak ? (
                      <td colSpan={WORKING_DAYS.length} className="p-2 border border-slate-200 text-center text-amber-700 text-xs font-medium">
                        Lunch Break
                      </td>
                    ) : (
                      WORKING_DAYS.map((d) => {
                        const cell = cellValue(d, p.periodNumber);
                        if (!canEdit) {
                          return (
                            <td key={d} className="p-2 border border-slate-200 text-xs">
                              {cell?.subject?.name || "-"}
                              {cell?.teacher && (
                                <span className="block text-slate-400">{cell.teacher.name}</span>
                              )}
                            </td>
                          );
                        }
                        return (
                          <td key={d} className="p-1 border border-slate-200 space-y-0.5">
                            <select
                              value={cell?.subjectId || ""}
                              onChange={(e) => setCell(d, p.periodNumber, "subjectId", e.target.value)}
                              className="text-xs border-0 w-full bg-transparent focus:outline-none"
                            >
                              <option value="">Subject -</option>
                              {subjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                            <select
                              value={cell?.teacherId || ""}
                              onChange={(e) => setCell(d, p.periodNumber, "teacherId", e.target.value)}
                              className="text-xs border-0 w-full bg-transparent focus:outline-none text-indigo-600"
                            >
                              <option value="">Teacher -</option>
                              {staffList.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                          </td>
                        );
                      })
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {!sectionId && <p className="text-slate-400">Pehle class/section select karo</p>}
    </div>
  );
}
