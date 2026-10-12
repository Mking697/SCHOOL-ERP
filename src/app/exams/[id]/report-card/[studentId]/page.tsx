import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { gradeFor } from "@/lib/grading";
import PrintButton from "./print-button";

export const instant = false;

export default async function ReportCardPage({
  params,
}: {
  params: Promise<{ id: string; studentId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id: examId, studentId } = await params;

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
      grade: percentage !== null ? gradeFor(percentage) : "-",
    };
  });

  const totalMax = exam.subjects.reduce((s, es) => s + es.maxMarks, 0);
  const totalObtained = rows.reduce((s, r) => s + (r.obtained || 0), 0);
  const overallPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  const overallGrade = gradeFor(overallPercentage);

  return (
    <div className="min-h-screen bg-gray-100 p-8 print:bg-white print:p-0">
      <div className="max-w-xl mx-auto">
        <div className="mb-4 print:hidden">
          <PrintButton />
        </div>
        <div className="bg-white border-2 border-gray-800 rounded-lg p-6 print:shadow-none">
          <div className="text-center border-b pb-2 mb-4">
            <p className="font-bold text-lg">{school?.name}</p>
            <p className="text-sm text-gray-500">Report Card -- {exam.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
            <p>
              <span className="text-gray-500">Student:</span> {student.firstName}{" "}
              {student.lastName}
            </p>
            <p>
              <span className="text-gray-500">Admission No:</span> {student.admissionNo}
            </p>
            <p>
              <span className="text-gray-500">Class:</span> {exam.classLevel.name}
              {student.section ? ` - ${student.section.name}` : ""}
            </p>
          </div>

          <table className="w-full text-sm mb-4">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Subject</th>
                <th className="p-2 text-right">Max Marks</th>
                <th className="p-2 text-right">Obtained</th>
                <th className="p-2 text-right">Grade</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.subject} className="border-t">
                  <td className="p-2">{r.subject}</td>
                  <td className="p-2 text-right">{r.maxMarks}</td>
                  <td className="p-2 text-right">{r.obtained ?? "-"}</td>
                  <td className="p-2 text-right">{r.grade}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t font-semibold">
                <td className="p-2">Total</td>
                <td className="p-2 text-right">{totalMax}</td>
                <td className="p-2 text-right">{totalObtained}</td>
                <td className="p-2 text-right">{overallGrade}</td>
              </tr>
              <tr>
                <td colSpan={4} className="p-2 text-right">
                  Percentage: {overallPercentage.toFixed(2)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
