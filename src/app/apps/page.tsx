import { prisma } from "@/lib/db";
import { connection } from "next/server";
import { BrandMark } from "@/components/ui/brand-mark";
import Link from "next/link";
import {
  Smartphone,
  LayoutDashboard,
  Truck,
  Fingerprint,
  Globe,
  ShieldCheck,
  ArrowRight,
  Clock,
} from "lucide-react";

export const instant = false;

type AppTile = {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  action: { label: string; href: string } | null;
  status: "live" | "soon";
  color: string;
};

export default async function AppsPage() {
  await connection();
  const school = await prisma.school.findFirst();
  const schoolName = school?.name || "School ERP";

  const apps: AppTile[] = [
    {
      icon: Smartphone,
      title: "Parent & Student App",
      subtitle: "13 Modules",
      description:
        "Login with your child's Admission No + Password. Works as an installable app on any phone (Add to Home Screen) -- no app store needed.",
      features: [
        "Attendance, Timetable, Homework",
        "Fees & Online Payment",
        "Exams & Report Cards",
        "My Bus (Live GPS)",
        "Library, Events, Notices",
        "Behavior & Achievements",
      ],
      action: { label: "Open Parent & Student Portal", href: "/portal/login" },
      status: "live",
      color: "emerald",
    },
    {
      icon: LayoutDashboard,
      title: "Staff & Admin App",
      subtitle: "16+ Modules",
      description:
        "For teachers, accountants and school admins. Also installable as an app on desktop or phone -- the same login works everywhere.",
      features: [
        "Students, Classes, Exams, Timetable",
        "Fees & Accounting",
        "Attendance, Behavior, Analytics",
        "Transport, Library, Inventory, HR",
      ],
      action: { label: "Open Staff & Admin Login", href: "/login" },
      status: "live",
      color: "indigo",
    },
    {
      icon: Globe,
      title: "School Portal (Web Dashboard)",
      subtitle: "This website, on any browser",
      description:
        "The full ERP runs in any modern browser on desktop, tablet or phone -- no installation required at all if you'd rather not install the app.",
      features: ["Works on any device", "No install required", "Always up to date"],
      action: { label: "Open Dashboard", href: "/login" },
      status: "live",
      color: "sky",
    },
    {
      icon: Truck,
      title: "Driver App",
      subtitle: "Live GPS tracking",
      description:
        "For bus/van drivers to share live location during a trip so parents can track their child's bus in real time, right from the driver's own phone browser.",
      features: ["Live location sharing (GPS)", "Route & stop list", "Vehicle Number + Password login"],
      action: { label: "Open Driver App", href: "/driver/login" },
      status: "live",
      color: "amber",
    },
    {
      icon: Fingerprint,
      title: "Biometric Attendance Agent",
      subtitle: "Windows .exe for fingerprint/face devices",
      description:
        "A background Windows service that syncs attendance from a biometric device (e.g. ZKTeco) into the ERP automatically. Needs real hardware to build and test against -- not yet built.",
      features: ["Fingerprint/face sync", "Runs as a Windows service", "Automatic attendance marking"],
      action: null,
      status: "soon",
      color: "rose",
    },
    {
      icon: ShieldCheck,
      title: "Super Admin / Vendor Panel",
      subtitle: "Multi-school subscription & billing",
      description:
        "For the software vendor only -- manage every school's subscription, billing and deployment from one place. Planned next.",
      features: ["Multi-school management", "Subscription billing", "Remote deployment management"],
      action: null,
      status: "soon",
      color: "slate",
    },
  ];

  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-700",
    indigo: "bg-indigo-100 text-indigo-700",
    sky: "bg-sky-100 text-sky-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
    slate: "bg-slate-200 text-slate-700",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center overflow-hidden">
            <BrandMark logoUrl={school?.logoUrl || null} schoolName={schoolName} className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{schoolName}</h1>
            <p className="text-sm text-slate-500">Apps &amp; Downloads</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <p className="text-slate-600 mb-8 max-w-2xl">
          One ERP, multiple apps for different people. Each one works right from your browser --
          install it to your home screen like a native app, no app store needed.
        </p>

        <div className="grid sm:grid-cols-2 gap-5">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.title}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[app.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {app.status === "soon" && (
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      Coming Soon
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-slate-900">{app.title}</h3>
                <p className="text-sm text-slate-500 mb-2">{app.subtitle}</p>
                <p className="text-sm text-slate-600 mb-3 flex-1">{app.description}</p>
                <ul className="text-xs text-slate-500 mb-4 space-y-1">
                  {app.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                {app.action ? (
                  <Link
                    href={app.action.href}
                    className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-4 py-2 transition-colors"
                  >
                    {app.action.label}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-slate-400 bg-slate-100 rounded-lg px-4 py-2 cursor-not-allowed">
                    Not available yet
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
