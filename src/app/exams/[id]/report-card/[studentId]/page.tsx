import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getPortalSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/db";
import { gradeFor } from "@/lib/grading";
import PrintButton from "./print-button";
import { BrandMark } from "@/components/ui/brand-mark";

export const instant = false;

export default async function ReportCardPage({
  params,
}: {
  params: Promise<{ id: string; studentId: string }>;
}) {
  const { id: examId, studentId } = await params;

  const session = await getSession();
  const portalSession = session ? null : await getPortalSession();
  if (!session && !portalSession) redirect("/login");
  if (portalSession && portalSession.studentId !== studentId) redirect("/portal");

  const [exam, student, school] = await Promise.all([
    prisma.exam.findUnique({
      where: { id: examId },
      include: {
        classLevel: true,
        subjects: {
          include: {
            subject: true,
            marks: { where: { studentId } },
          },
        },
      },
    }),
    prisma.student.findUnique({
      where: { id: studentId },
      include: { section: true },
    }),
    prisma.school.findFirst(),
  ]);

  if (!exam || !student) notFound();

  const rows = exam.subjects.map((es) => {
    const mark = es.marks[0];
    const obtained = mark ? Number(mark.marksObtained) : null;
    const percentage = obtained !== null ? (obtained / es.maxMarks) * 100 : null;
    return {
      subject: es.subject.name,
      maxMarks: es.maxMarks,
      obtained,
      percentage,
      grade: percentage !== null ? gradeFor(percentage) : "-",
    };
  });

  const totalMax = exam.subjects.reduce((s, es) => s + es.maxMarks, 0);
  const totalObtained = rows.reduce((s, r) => s + (r.obtained || 0), 0);
  const overallPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  const overallGrade = gradeFor(overallPercentage);
  const hasFail = rows.some((r) => r.grade === "F");
  const hasIncomplete = rows.some((r) => r.obtained === null);
  const result = hasIncomplete ? "INCOMPLETE" : hasFail ? "FAIL" : "PASS";

  const gradeColor: Record<string, string> = {
    "A+": "text-emerald-700 bg-emerald-50",
    A: "text-emerald-700 bg-emerald-50",
    "B+": "text-sky-700 bg-sky-50",
    B: "text-sky-700 bg-sky-50",
    C: "text-amber-700 bg-amber-50",
    D: "text-amber-700 bg-amber-50",
    F: "text-rose-700 bg-rose-50",
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 print:bg-white print:p-0">
      <div className="max-w-2xl mx-auto px-4 print:px-0">
        <div className="mb-5 print:hidden flex justify-center">
          <PrintButton />
        </div>

        <div className="bg-white rounded-2xl shadow-xl print:shadow-none border border-slate-200 overflow-hidden">
          {/* Letterhead */}
          <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white px-8 py-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 shrink-0 flex items-center justify-center overflow-hidden">
                <BrandMark logoUrl={school?.logoUrl} schoolName={school?.name} className="w-6 h-6" />
              </div>
              <p className="font-bold text-xl">{school?.name || "School Name"}</p>
            </div>
            <p className="text-sm text-indigo-200 mt-1 uppercase tracking-widest">
              Academic Report Card
            </p>
          </div>

          <div className="px-8 py-6">
            <p className="text-center text-sm font-semibold text-slate-700 mb-5">{exam.title}</p>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-6 bg-slate-50 rounded-lg p-4">
              <p>
                <span className="text-slate-400">Student Name</span>
                <span className="block font-medium text-slate-900">
                  {student.firstName} {student.lastName}
                </span>
              </p>
              <p>
                <span className="text-slate-400">Admission No.</span>
                <span className="block font-medium text-slate-900">{student.admissionNo}</span>
              </p>
              <p>
                <span className="text-slate-400">Class</span>
                <span className="block font-medium text-slate-900">
                  {exam.classLevel.name}
                  {student.section ? ` - ${student.section.name}` : ""}
                </span>
              </p>
              <p>
                <span className="text-slate-400">Result</span>
                <span
                  className={`inline-block mt-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                    result === "PASS"
                      ? "bg-emerald-100 text-emerald-700"
                      : result === "INCOMPLETE"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {result}
                </span>
              </p>
            </div>

            <table className="w-full text-sm mb-6 border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="p-2.5 text-left font-medium">Subject</th>
                  <th className="p-2.5 text-right font-medium">Max Marks</th>
                  <th className="p-2.5 text-right font-medium">Obtained</th>
                  <th className="p-2.5 text-right font-medium">Grade</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.subject} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="p-2.5 border-t border-slate-100">{r.subject}</td>
                    <td className="p-2.5 text-right border-t border-slate-100">{r.maxMarks}</td>
                    <td className="p-2.5 text-right border-t border-slate-100 font-medium">
                      {r.obtained ?? "-"}
                    </td>
                    <td className="p-2.5 text-right border-t border-slate-100">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${gradeColor[r.grade] || ""}`}>
                        {r.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-semibold">
                  <td className="p-2.5 border-t border-slate-200">Total</td>
                  <td className="p-2.5 text-right border-t border-slate-200">{totalMax}</td>
                  <td className="p-2.5 text-right border-t border-slate-200">{totalObtained}</td>
                  <td className="p-2.5 text-right border-t border-slate-200">{overallGrade}</td>
                </tr>
              </tfoot>
            </table>

            <div className="flex items-center justify-between bg-indigo-50 rounded-lg px-5 py-3 mb-10">
              <p className="text-sm font-medium text-indigo-900">Overall Percentage</p>
              <p className="text-2xl font-bold text-indigo-700">{overallPercentage.toFixed(2)}%</p>
            </div>

            <div className="grid grid-cols-2 gap-8 text-center text-xs text-slate-500 pt-6">
              <div className="border-t border-slate-300 pt-1.5">Class Teacher</div>
              <div className="border-t border-slate-300 pt-1.5">Principal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
