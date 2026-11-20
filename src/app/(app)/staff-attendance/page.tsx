"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type Row = { id: string; name: string; designation: string; status: string | null };

const STATUSES = ["PRESENT", "ABSENT", "LATE", "HALF_DAY"];

export default function StaffAttendancePage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<Row[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function load() {
    fetch(`/api/staff-attendance?date=${date}`).then((r) => r.json()).then(setRows).catch(() => {});
  }

  useEffect(load, [date]);

  function setStatus(id: string, status: string) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const entries = rows.filter((r) => r.status).map((r) => ({ staffId: r.id, status: r.status }));
      await fetch("/api/staff-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, entries }),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Staff Attendance" description="Mark daily attendance for all staff" />

      <div className="flex items-end gap-4 mb-4">
        <div>
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" />
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save Attendance"}
        </Button>
        {saved && <span className="text-emerald-600 text-sm">Saved</span>}
      </div>

      <Card>
        <div className="divide-y divide-slate-100">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-4 py-2.5">
              <div>
                <p className="text-sm font-medium text-slate-800">{r.name}</p>
                <p className="text-xs text-slate-400">{r.designation}</p>
              </div>
              <div className="flex gap-1.5">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(r.id, s)}
                    className={`text-xs px-2.5 py-1 rounded-full border ${
                      r.status === s
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="text-sm text-slate-400 p-4">Koi staff nahi mila</p>}
        </div>
      </Card>
    </div>
  );
}
