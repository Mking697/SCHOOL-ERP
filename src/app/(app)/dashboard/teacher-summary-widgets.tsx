"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, Wallet, PartyPopper, CalendarDays } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Summary = {
  attendance: { present: number; absent: number; totalMarked: number };
  payslips: { id: string; month: string; amount: string; status: string }[];
  holidays: { id: string; date: string; title: string }[];
  events: { id: string; eventDate: string; title: string }[];
};

export default function TeacherSummaryWidgets() {
  const [data, setData] = useState<Summary | null>(null);

  useEffect(() => {
    fetch("/api/teacher/summary").then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data) return null;

  const latestPayslip = data.payslips[0];

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader>
          <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 text-emerald-500" />
            My Attendance (this month)
          </p>
        </CardHeader>
        <CardBody>
          <p className="text-2xl font-semibold text-slate-900">{data.attendance.present}</p>
          <p className="text-xs text-slate-500">
            Present &middot; {data.attendance.absent} Absent &middot; {data.attendance.totalMarked} marked
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-indigo-500" />
            My Salary
          </p>
        </CardHeader>
        <CardBody>
          {latestPayslip ? (
            <>
              <p className="text-2xl font-semibold text-slate-900">
                Rs {Number(latestPayslip.amount).toFixed(0)}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                {latestPayslip.month}{" "}
                <Badge tone={latestPayslip.status === "PAID" ? "green" : "yellow"}>
                  {latestPayslip.status}
                </Badge>
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">Koi payslip abhi nahi bana</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <PartyPopper className="w-4 h-4 text-amber-500" />
            Upcoming Holidays
          </p>
        </CardHeader>
        <CardBody>
          {data.holidays.length === 0 ? (
            <p className="text-sm text-slate-400">Koi upcoming holiday nahi</p>
          ) : (
            <ul className="space-y-1">
              {data.holidays.map((h) => (
                <li key={h.id} className="text-xs text-slate-600">
                  {new Date(h.date).toLocaleDateString()} -- {h.title}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-sky-500" />
            Upcoming Events
          </p>
        </CardHeader>
        <CardBody>
          {data.events.length === 0 ? (
            <p className="text-sm text-slate-400">Koi upcoming event nahi</p>
          ) : (
            <ul className="space-y-1">
              {data.events.map((e) => (
                <li key={e.id} className="text-xs text-slate-600">
                  {new Date(e.eventDate).toLocaleDateString()} -- {e.title}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
