"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, Home, CalendarCheck, Wallet, BookOpenCheck, GraduationCap, Megaphone, LayoutGrid } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";

const navItems = [
  { href: "/portal", label: "Home", icon: Home },
  { href: "/portal/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/portal/fees", label: "Fees", icon: Wallet },
  { href: "/portal/homework", label: "Homework", icon: BookOpenCheck },
  { href: "/portal/exams", label: "Exams", icon: GraduationCap },
  { href: "/portal/notices", label: "Notices", icon: Megaphone },
];

export default function PortalChrome({
  schoolName,
  logoUrl,
  studentName,
  className,
  children,
}: {
  schoolName: string;
  logoUrl: string | null;
  studentName: string;
  className: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/portal/auth/logout", { method: "POST" });
    router.push("/portal/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-30 bg-emerald-800 text-white">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
              <BrandMark logoUrl={logoUrl} schoolName={schoolName} className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate leading-tight">{schoolName}</p>
              <p className="text-[11px] text-emerald-200 truncate leading-tight">
                {studentName} &middot; {className}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-emerald-200 hover:text-white p-2 rounded-lg hover:bg-white/10 shrink-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between px-4">
        <nav className="hidden sm:flex items-center gap-1 pb-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  active ? "bg-white/15 text-white font-medium" : "text-emerald-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <a
          href="/apps"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 mb-2 rounded-lg text-xs text-emerald-200 hover:text-white hover:bg-white/10"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          All Apps
        </a>
        </div>
      </header>

      <main className="flex-1 p-4 pb-20 sm:pb-6 max-w-3xl w-full mx-auto">{children}</main>

      {/* Mobile bottom tab bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around h-16 z-30">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] ${
                active ? "text-emerald-700" : "text-slate-400"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
