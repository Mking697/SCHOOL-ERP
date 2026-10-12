import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import NewStaffForm from "./new-staff-form";

export const instant = false;

export default async function StaffPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const staff = await prisma.staff.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">Staff / HR</h1>

      <NewStaffForm />

      <div className="bg-white rounded-lg shadow overflow-hidden max-w-3xl mt-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Designation</th>
              <th className="p-3">Department</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.designation}</td>
                <td className="p-3">{s.department || "-"}</td>
                <td className="p-3">{s.phone || "-"}</td>
                <td className="p-3">
                  {s.isActive ? (
                    <span className="text-green-700">Active</span>
                  ) : (
                    <span className="text-gray-400">Inactive</span>
                  )}
                </td>
                <td className="p-3">
                  <Link href={`/staff/${s.id}`} className="text-blue-600">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {staff.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  Koi staff add nahi kiya abhi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
