"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function Topbar({
  schoolName,
  userEmail,
  userRole,
  licensed,
}: {
  schoolName: string;
  userEmail: string;
  userRole: string;
  licensed: boolean;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3 pl-10 lg:pl-0">
        <p className="font-semibold text-slate-900 text-sm truncate max-w-[50vw]">{schoolName}</p>
        {!licensed && (
          <a
            href="/license"
            className="hidden sm:inline-flex items-center text-xs font-medium bg-amber-100 text-amber-800 rounded-full px-2.5 py-1"
          >
            Unlicensed
          </a>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-800 leading-tight">{userEmail}</p>
          <p className="text-xs text-slate-400 leading-tight">{userRole.replace("_", " ")}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">
          {userEmail.charAt(0).toUpperCase()}
        </div>
        <button
          onClick={handleLogout}
          className="text-slate-400 hover:text-rose-600 transition-colors p-2 rounded-lg hover:bg-rose-50"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
