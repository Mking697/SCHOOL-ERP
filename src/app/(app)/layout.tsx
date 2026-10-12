import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export const instant = false;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const school = await prisma.school.findFirst({ include: { license: true } });
  const license = school?.license;
  const isExpired = license?.expiresAt ? new Date(license.expiresAt) < new Date() : false;
  const licensed = Boolean(license?.isActive && !isExpired);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          schoolName={school?.name || "School ERP"}
          userEmail={session.email}
          userRole={session.role}
          licensed={licensed}
        />
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
