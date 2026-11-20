"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, Bell, BellOff } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type Period = {
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
  subject: { name: string } | null;
  section: { name: string; classLevel: { name: string } } | null;
};

// Minutes since midnight, for comparing against "HH:MM" period times.
function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export default function TeacherLiveTimetable() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [notifyOn, setNotifyOn] = useState(false);
  const [tick, setTick] = useState(0);
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/teacher/timetable")
      .then((r) => r.json())
      .then((d) => {
        setEntries(d.entries || []);
        setPeriods(d.periods || []);
      })
      .catch(() => {});
    if (typeof Notification !== "undefined") {
      setNotifyOn(Notification.permission === "granted");
    }
  }, []);

  // Re-render every 30s so the "current period" highlight and the
  // start/end alerts stay accurate without a full page reload.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const todayDow = new Date().getDay();
  const todayEntries = entries
    .filter((e) => e.dayOfWeek === todayDow)
    .sort((a, b) => a.periodNumber - b.periodNumber);
  const teachingPeriods = periods.filter((p) => !p.isBreak).sort((a, b) => a.periodNumber - b.periodNumber);

  const now = nowMinutes();
  const current = teachingPeriods.find((p) => now >= toMinutes(p.startTime) && now < toMinutes(p.endTime));
  const next = teachingPeriods.find((p) => toMinutes(p.startTime) > now);
  const currentEntry = current ? todayEntries.find((e) => e.periodNumber === current.periodNumber) : null;
  const nextEntry = next ? todayEntries.find((e) => e.periodNumber === next.periodNumber) : null;

  // Fire a real browser notification exactly once per period-start and
  // once per period-ending-soon (2 min before end) -- works while this tab
  // is open, even backgrounded; does NOT require a service worker.
  useEffect(() => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    if (current && currentEntry) {
      const startKey = `start-${current.id}-${new Date().toDateString()}`;
      if (now - toMinutes(current.startTime) <= 1 && !firedRef.current.has(startKey)) {
        firedRef.current.add(startKey);
        new Notification("Period shuru ho gaya", {
          body: `${current.label}: ${currentEntry.subject?.name || "Class"} -- ${currentEntry.section?.classLevel.name} ${currentEntry.section?.name}`,
        });
      }
      const endKey = `end-${current.id}-${new Date().toDateString()}`;
      if (toMinutes(current.endTime) - now <= 2 && toMinutes(current.endTime) - now > 0 && !firedRef.current.has(endKey)) {
        firedRef.current.add(endKey);
        const nextLabel = nextEntry
          ? `Next: ${next?.label} -- ${nextEntry.subject?.name || "Class"} (${nextEntry.section?.classLevel.name} ${nextEntry.section?.name})`
          : "Next: koi aur period nahi hai";
        new Notification("Period khatam hone wala hai", { body: nextLabel });
      }
    }
  }, [tick, current, currentEntry, next, nextEntry, now]);

  async function enableNotifications() {
    if (typeof Notification === "undefined") return;
    const perm = await Notification.requestPermission();
    setNotifyOn(perm === "granted");
  }

  if (periods.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-indigo-500" />
          My Timetable -- Today
        </p>
        {!notifyOn && (
          <button
            onClick={enableNotifications}
            className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
          >
            <Bell className="w-3.5 h-3.5" />
            Period alerts on karo
          </button>
        )}
        {notifyOn && (
          <span className="text-xs flex items-center gap-1 text-emerald-600">
            <Bell className="w-3.5 h-3.5" />
            Alerts on
          </span>
        )}
      </CardHeader>
      <CardBody>
        {todayEntries.length === 0 ? (
          <p className="text-sm text-slate-400">Aaj koi period assign nahi hai</p>
        ) : (
          <div className="space-y-2">
            {teachingPeriods.map((p) => {
              const e = todayEntries.find((x) => x.periodNumber === p.periodNumber);
              if (!e) return null;
              const isCurrent = current?.id === p.id;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                    isCurrent
                      ? "bg-indigo-600 text-white font-medium animate-pulse"
                      : "bg-slate-50 text-slate-600"
                  }`}
                >
                  <span>
                    {p.label} ({p.startTime}-{p.endTime})
                  </span>
                  <span>
                    {e.subject?.name || "-"} -- {e.section?.classLevel.name} {e.section?.name}
                  </span>
                  {isCurrent && <span className="text-xs">LIVE NOW</span>}
                </div>
              );
            })}
          </div>
        )}
        {!notifyOn && typeof Notification !== "undefined" && Notification.permission === "denied" && (
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <BellOff className="w-3.5 h-3.5" />
            Notifications block hai -- browser settings me allow karo
          </p>
        )}
      </CardBody>
    </Card>
  );
}
