import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export const instant = false;

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const student = await prisma.student.findUnique({
    where: { id },
    include: { section: { include: { classLevel: true } } },
  });

  if (!student) notFound();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">
          {student.firstName} {student.lastName}
        </h1>
        <div className="flex gap-2">
          <Link
            href={`/students/${student.id}/id-card`}
            className="bg-gray-700 text-white rounded px-4 py-2 text-sm"
          >
            ID Card
          </Link>
          <Link href="/students" className="text-blue-600 text-sm self-center">
            &larr; Back to list
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Admission No</p>
          <p className="font-medium">{student.admissionNo}</p>
        </div>
        <div>
          <p className="text-gray-500">Class</p>
          <p className="font-medium">
            {student.section
              ? `${student.section.classLevel.name} - ${student.section.name}`
              : "Not assigned"}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Date of Birth</p>
          <p className="font-medium">
            {student.dob ? new Date(student.dob).toLocaleDateString() : "-"}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Gender</p>
          <p className="font-medium">{student.gender || "-"}</p>
        </div>
        <div>
          <p className="text-gray-500">Guardian</p>
          <p className="font-medium">{student.guardianName || "-"}</p>
        </div>
        <div>
          <p className="text-gray-500">Guardian Phone</p>
          <p className="font-medium">{student.guardianPhone || "-"}</p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-500">Address</p>
          <p className="font-medium">{student.address || "-"}</p>
        </div>
        <div>
          <p className="text-gray-500">Admitted On</p>
          <p className="font-medium">
            {new Date(student.admittedAt).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Status</p>
          <p className="font-medium">{student.isActive ? "Active" : "Inactive"}</p>
        </div>
      </div>
    </div>
  );
}
