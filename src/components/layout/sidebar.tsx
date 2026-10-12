"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { GraduationCap, ChevronDown, X, Menu } from "lucide-react";
import { navGroups } from "./nav-config";

function SidebarContent({
  schoolName,
  logoUrl,
  onNavigate,
}: {
  schoolName: string;
  logoUrl: string | null;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  // Pick the single longest-matching href across ALL nav items so a parent
  // route (e.g. /students) doesn't stay highlighted alongside a more
  // specific child route (e.g. /students/new) that also starts with it.
  const allHrefs = navGroups.flatMap((g) => g.items.map((i) => i.href));
  const activeHref = allHrefs
    .filter((href) => pathname === href || pathname.startsWith(href + "/"))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-slate-800">
        <div className="bg-indigo-600 rounded-lg p-1.5 w-8 h-8 flex items-center justify-center shrink-0 overflow-hidden">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={schoolName} className="w-full h-full object-contain" />
          ) : (
            <GraduationCap className="w-5 h-5 text-white" />
          )}
        </div>
        <span className="font-semibold text-white tracking-tight truncate">{schoolName}</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.href === activeHref;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                      active
                        ? "bg-indigo-600 text-white font-medium"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}

export function Sidebar({ schoolName, logoUrl }: { schoolName: string; logoUrl: string | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-slate-900 h-screen sticky top-0">
        <SidebarContent schoolName={schoolName} logoUrl={logoUrl} />
      </aside>

      {/* Mobile top bar trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 bg-slate-900 text-white rounded-lg p-2 shadow-lg"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-slate-900 shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-3 text-slate-400 hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent
              schoolName={schoolName}
              logoUrl={logoUrl}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  );
}

export function GroupChevron() {
  return <ChevronDown className="w-3.5 h-3.5" />;
}
