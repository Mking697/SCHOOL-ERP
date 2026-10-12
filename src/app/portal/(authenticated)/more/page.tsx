import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import {
  GraduationCap,
  Megaphone,
  CalendarClock,
  CalendarDays,
  Library,
  Bus,
  Trophy,
  User,
} from "lucide-react";

export const instant = false;

const items = [
  { href: "/portal/exams", label: "Exams & Report Cards", icon: GraduationCap, color: "indigo" },
  { href: "/portal/notices", label: "Notices", icon: Megaphone, color: "indigo" },
  { href: "/portal/timetable", label: "Timetable", icon: CalendarClock, color: "sky" },
  { href: "/portal/events", label: "Events", icon: CalendarDays, color: "sky" },
  { href: "/portal/library", label: "My Books", icon: Library, color: "amber" },
  { href: "/portal/transport", label: "My Bus (Live GPS)", icon: Bus, color: "amber" },
  { href: "/portal/behavior", label: "Behavior & Achievements", icon: Trophy, color: "emerald" },
  { href: "/portal/profile", label: "Profile & ID Card", icon: User, color: "emerald" },
];

const colorMap: Record<string, string> = {
  indigo: "bg-indigo-100 text-indigo-700",
  sky: "bg-sky-100 text-sky-700",
  amber: "bg-amber-100 text-amber-700",
  emerald: "bg-emerald-100 text-emerald-700",
};

export default function PortalMorePage() {
  return (
    <div>
      <PageHeader title="More" description="All modules" />
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col items-start gap-3 hover:border-slate-300"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[item.color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-800">{item.label}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
