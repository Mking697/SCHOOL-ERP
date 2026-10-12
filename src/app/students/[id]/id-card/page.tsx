import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import PrintButton from "./print-button";

export const instant = false;

export default async function StudentIdCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const [student, school] = await Promise.all([
    prisma.student.findUnique({
      where: { id },
      include: { section: { include: { classLevel: true } } },
    }),
    prisma.school.findFirst(),
  ]);

  if (!student) notFound();

  return (
    <div className="min-h-screen bg-gray-100 p-8 print:bg-white print:p-0">
      <div className="max-w-sm mx-auto">
        <div className="mb-4 print:hidden">
          <PrintButton />
        </div>

        <div className="bg-white border-2 border-gray-800 rounded-lg p-4 shadow print:shadow-none">
          <div className="text-center border-b pb-2 mb-2">
            <p className="font-bold text-lg">{school?.name || "School Name"}</p>
            <p className="text-xs text-gray-500">Student ID Card</p>
          </div>

          <div className="flex gap-4">
            <div className="w-20 h-24 bg-gray-200 border flex items-center justify-center text-xs text-gray-400 shrink-0">
              Photo
            </div>
            <div className="text-sm space-y-1">
              <p className="font-semibold">
                {student.firstName} {student.lastName}
              </p>
              <p>Adm No: {student.admissionNo}</p>
              <p>
                Class:{" "}
                {student.section
                  ? `${student.section.classLevel.name} - ${student.section.name}`
                  : "-"}
              </p>
              <p>DOB: {student.dob ? new Date(student.dob).toLocaleDateString() : "-"}</p>
              <p>Guardian: {student.guardianName || "-"}</p>
              <p>Phone: {student.guardianPhone || "-"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
