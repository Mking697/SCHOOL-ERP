import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";
import { Plus, Search } from "lucide-react";

export const instant = false;

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { q } = await searchParams;

  const students = await prisma.student.findMany({
    where: q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { admissionNo: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { section: { include: { classLevel: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Students"
        description="Manage student admissions and records"
        actions={
          <Link href="/students/new">
            <Button variant="primary">
              <Plus className="w-4 h-4" />
              New Admission
            </Button>
          </Link>
        }
      />

      <form className="mb-4" method="get">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by name or admission no."
            className="pl-9"
          />
        </div>
      </form>

      <Card>
        <Table>
          <Thead>
            <tr>
              <Th>Admission No</Th>
              <Th>Name</Th>
              <Th>Class</Th>
              <Th>Guardian</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </Thead>
          <tbody>
            {students.map((s) => (
              <Tr key={s.id}>
                <Td>{s.admissionNo}</Td>
                <Td>
                  {s.firstName} {s.lastName}
                </Td>
                <Td>
                  {s.section
                    ? `${s.section.classLevel.name} - ${s.section.name}`
                    : "-"}
                </Td>
                <Td>{s.guardianName || "-"}</Td>
                <Td>
                  {s.isActive ? (
                    <Badge tone="green">Active</Badge>
                  ) : (
                    <Badge tone="slate">Inactive</Badge>
                  )}
                </Td>
                <Td>
                  <Link href={`/students/${s.id}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
                    View
                  </Link>
                </Td>
              </Tr>
            ))}
            {students.length === 0 && (
              <EmptyRow colSpan={6}>Koi student nahi mila</EmptyRow>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
