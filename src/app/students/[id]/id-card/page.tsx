import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import PrintButton from "./print-button";
import { GraduationCap } from "lucide-react";

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

  const className = student.section
    ? `${student.section.classLevel.name} - ${student.section.name}`
    : "-";

  return (
    <div className="min-h-screen bg-slate-100 py-10 print:bg-white print:p-0">
      <div className="max-w-xs mx-auto">
        <div className="mb-5 print:hidden flex justify-center">
          <PrintButton />
        </div>

        {/* ID card -- CR80 credit-card proportions */}
        <div className="bg-white rounded-2xl shadow-xl print:shadow-none overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-4 py-3 text-white">
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 shrink-0" />
              <p className="font-bold text-[13px] leading-tight truncate">
                {school?.name || "School Name"}
              </p>
            </div>
            <p className="text-[9px] text-indigo-200 tracking-widest uppercase mt-0.5">
              Student Identity Card
            </p>
          </div>

          <div className="p-4 flex gap-3">
            <div className="w-16 h-20 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] text-slate-400 shrink-0">
              Photo
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="font-bold text-sm text-slate-900 leading-tight truncate">
                {student.firstName} {student.lastName}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Adm No: {student.admissionNo}</p>
              <p className="text-[10px] text-slate-500">Class: {className}</p>
            </div>
          </div>

          <div className="px-4 pb-3 grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px]">
            <p className="text-slate-400">
              DOB
              <span className="block text-slate-700 font-medium">
                {student.dob ? new Date(student.dob).toLocaleDateString() : "-"}
              </span>
            </p>
            <p className="text-slate-400">
              Guardian
              <span className="block text-slate-700 font-medium truncate">
                {student.guardianName || "-"}
              </span>
            </p>
            <p className="text-slate-400 col-span-2">
              Phone <span className="text-slate-700 font-medium">{student.guardianPhone || "-"}</span>
            </p>
          </div>

          <div className="border-t border-dashed border-slate-200 px-4 py-2 flex items-center justify-between">
            <div className="font-mono text-[9px] tracking-[3px] text-slate-400">
              ||{student.admissionNo}||
            </div>
            <p className="text-[8px] text-slate-400">Valid for current session</p>
          </div>
        </div>
      </div>
    </div>
  );
}
