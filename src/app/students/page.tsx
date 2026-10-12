import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export const instant = false;

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { q } = await searchParams;

  const students = await prisma.student.findMany({
    where: q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { admissionNo: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { section: { include: { classLevel: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Students</h1>
        <Link
          href="/students/new"
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm"
        >
          + New Admission
        </Link>
      </div>

      <form className="mb-4" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by name or admission no."
          className="border rounded px-3 py-2 w-full max-w-sm"
        />
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Admission No</th>
              <th className="p-3">Name</th>
              <th className="p-3">Class</th>
              <th className="p-3">Guardian</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3">{s.admissionNo}</td>
                <td className="p-3">
                  {s.firstName} {s.lastName}
                </td>
                <td className="p-3">
                  {s.section
                    ? `${s.section.classLevel.name} - ${s.section.name}`
                    : "-"}
                </td>
                <td className="p-3">{s.guardianName || "-"}</td>
                <td className="p-3">
                  {s.isActive ? (
                    <span className="text-green-700">Active</span>
                  ) : (
                    <span className="text-gray-400">Inactive</span>
                  )}
                </td>
                <td className="p-3">
                  <Link href={`/students/${s.id}`} className="text-blue-600">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  Koi student nahi mila
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
