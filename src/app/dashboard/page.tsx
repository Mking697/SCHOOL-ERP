import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const instant = false;

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;

  if (!session) {
    redirect("/login");
  }

  const [studentCount, schoolCount] = await Promise.all([
    prisma.student.count(),
    prisma.school.count(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Logged in as {session.email} ({session.role})
      </p>
      <div className="flex gap-3 mb-6 text-sm">
        <a href="/students" className="bg-white rounded shadow px-4 py-2">
          Students
        </a>
        <a href="/students/new" className="bg-white rounded shadow px-4 py-2">
          New Admission
        </a>
        <a href="/classes" className="bg-white rounded shadow px-4 py-2">
          Classes &amp; Sections
        </a>
        <a href="/enquiries" className="bg-white rounded shadow px-4 py-2">
          Enquiries
        </a>
      </div>
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Schools</p>
          <p className="text-2xl font-bold">{schoolCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Students</p>
          <p className="text-2xl font-bold">{studentCount}</p>
        </div>
      </div>
    </div>
  );
}
