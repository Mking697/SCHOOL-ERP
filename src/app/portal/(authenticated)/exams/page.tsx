import { getPortalSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";
import { FileText } from "lucide-react";
import Link from "next/link";

export const instant = false;

export default async function PortalExamsPage() {
  const session = await getPortalSession();
  const student = await prisma.student.findUnique({
    where: { id: session!.studentId },
    select: { sectionId: true, section: { select: { classLevelId: true } } },
  });

  const exams = student?.section?.classLevelId
    ? await prisma.exam.findMany({
        where: { classLevelId: student.section.classLevelId },
        orderBy: { startDate: "desc" },
      })
    : [];

  return (
    <div>
      <PageHeader title="Exams" description="Your class exams and report cards" />
      <Card>
        <Table>
          <Thead>
            <tr>
              <Th>Exam</Th>
              <Th>Dates</Th>
              <Th>Report Card</Th>
            </tr>
          </Thead>
          <tbody>
            {exams.map((e) => (
              <Tr key={e.id}>
                <Td>{e.title}</Td>
                <Td>
                  {new Date(e.startDate).toLocaleDateString()} -{" "}
                  {new Date(e.endDate).toLocaleDateString()}
                </Td>
                <Td>
                  <Link
                    href={`/exams/${e.id}/report-card/${session!.studentId}`}
                    className="inline-flex items-center gap-1 text-indigo-600 text-sm font-medium"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View
                  </Link>
                </Td>
              </Tr>
            ))}
            {exams.length === 0 && <EmptyRow colSpan={3}>Koi exam abhi nahi hai</EmptyRow>}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
