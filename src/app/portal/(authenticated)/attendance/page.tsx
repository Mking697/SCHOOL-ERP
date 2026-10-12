import { getPortalSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";
import { Badge, statusTone } from "@/components/ui/badge";

export const instant = false;

export default async function PortalAttendancePage() {
  const session = await getPortalSession();
  const records = await prisma.attendance.findMany({
    where: { studentId: session!.studentId },
    orderBy: { date: "desc" },
    take: 90,
  });

  return (
    <div>
      <PageHeader title="Attendance History" description="Last 90 marked days" />
      <Card>
        <Table>
          <Thead>
            <tr>
              <Th>Date</Th>
              <Th>Status</Th>
            </tr>
          </Thead>
          <tbody>
            {records.map((r) => (
              <Tr key={r.id}>
                <Td>{new Date(r.date).toLocaleDateString()}</Td>
                <Td>
                  <Badge tone={statusTone(r.status)}>{r.status.replace("_", " ")}</Badge>
                </Td>
              </Tr>
            ))}
            {records.length === 0 && <EmptyRow colSpan={2}>Abhi tak koi attendance record nahi hai</EmptyRow>}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
