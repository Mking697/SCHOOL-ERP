import { getPortalSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";

export const instant = false;

export default async function PortalHomeworkPage() {
  const session = await getPortalSession();
  const student = await prisma.student.findUnique({
    where: { id: session!.studentId },
    select: { sectionId: true },
  });

  const homework = student?.sectionId
    ? await prisma.homework.findMany({
        where: { sectionId: student.sectionId },
        include: { subject: true },
        orderBy: { dueDate: "desc" },
        take: 50,
      })
    : [];

  return (
    <div>
      <PageHeader title="Homework" description="Assignments for your class" />
      <Card>
        <Table>
          <Thead>
            <tr>
              <Th>Subject</Th>
              <Th>Title</Th>
              <Th>Due Date</Th>
            </tr>
          </Thead>
          <tbody>
            {homework.map((h) => (
              <Tr key={h.id}>
                <Td>{h.subject.name}</Td>
                <Td>
                  {h.title}
                  {h.description && <p className="text-xs text-slate-400 mt-0.5">{h.description}</p>}
                </Td>
                <Td>{new Date(h.dueDate).toLocaleDateString()}</Td>
              </Tr>
            ))}
            {homework.length === 0 && <EmptyRow colSpan={3}>Koi homework abhi nahi hai</EmptyRow>}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
