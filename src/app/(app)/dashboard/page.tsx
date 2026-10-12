import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/ui/page-header";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { navGroups } from "@/components/layout/nav-config";

export const instant = false;

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [studentCount, staffCount, pendingInvoices, todayPresentCount, school] =
    await Promise.all([
      prisma.student.count(),
      prisma.staff.count(),
      prisma.invoice.count({ where: { status: { in: ["PENDING", "PARTIAL"] } } }),
      prisma.attendance.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
          status: "PRESENT",
        },
      }),
      prisma.school.findFirst(),
    ]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">
          {greeting}, {session.email.split("@")[0]}
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Here&apos;s what&apos;s happening at {school?.name || "your school"} today.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Students" value={studentCount} tone="indigo" />
        <StatCard label="Total Staff" value={staffCount} tone="sky" />
        <StatCard
          label="Pending Invoices"
          value={pendingInvoices}
          tone={pendingInvoices > 0 ? "amber" : "emerald"}
        />
        <StatCard label="Present Today" value={todayPresentCount} tone="emerald" />
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {navGroups
          .filter((g) => g.label !== "Overview")
          .map((group) => (
            <div key={group.label} className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">{group.label}</p>
              </div>
              <div className="p-2">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors group"
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                        {item.label}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
