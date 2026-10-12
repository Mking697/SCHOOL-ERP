import { getPortalSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const instant = false;

export default async function PortalLibraryPage() {
  const session = await getPortalSession();
  const issues = await prisma.bookIssue.findMany({
    where: { studentId: session!.studentId },
    include: { book: true },
    orderBy: { issueDate: "desc" },
  });

  return (
    <div>
      <PageHeader title="My Books" description="Books issued from the library" />
      <Card>
        <Table>
          <Thead>
            <tr>
              <Th>Book</Th>
              <Th>Issue Date</Th>
              <Th>Due Date</Th>
              <Th>Status</Th>
            </tr>
          </Thead>
          <tbody>
            {issues.map((i) => (
              <Tr key={i.id}>
                <Td>{i.book.title}</Td>
                <Td>{new Date(i.issueDate).toLocaleDateString()}</Td>
                <Td>{new Date(i.dueDate).toLocaleDateString()}</Td>
                <Td>
                  <Badge tone={i.status === "RETURNED" ? "slate" : "yellow"}>{i.status}</Badge>
                </Td>
              </Tr>
            ))}
            {issues.length === 0 && <EmptyRow colSpan={4}>Koi book issue nahi hui</EmptyRow>}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
