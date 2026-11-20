import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import NewStaffForm from "./new-staff-form";
import { PageHeader } from "@/components/ui/page-header";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ExportButtons from "@/components/export-buttons";
import type { ExportColumn } from "@/lib/export";

export const instant = false;

export default async function StaffPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const staff = await prisma.staff.findMany({ orderBy: { name: "asc" } });

  const exportRows = staff.map((s) => ({
    name: s.name,
    designation: s.designation,
    department: s.department || "-",
    phone: s.phone || "-",
    status: s.isActive ? "Active" : "Inactive",
  }));
  const columns: ExportColumn<(typeof exportRows)[number]>[] = [
    { header: "Name", value: (r) => r.name },
    { header: "Designation", value: (r) => r.designation },
    { header: "Department", value: (r) => r.department },
    { header: "Phone", value: (r) => r.phone },
    { header: "Status", value: (r) => r.status },
  ];

  return (
    <div>
      <PageHeader
        title="Staff / HR"
        description="Manage staff records, designations and contact details."
        actions={
          <>
            <ExportButtons data={exportRows} columns={columns} filename="staff" sheetName="Staff" />
            <NewStaffForm />
          </>
        }
      />

      <Card className="max-w-4xl overflow-hidden">
        <Table>
          <Thead>
            <tr>
              <Th>Name</Th>
              <Th>Designation</Th>
              <Th>Department</Th>
              <Th>Phone</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </Thead>
          <tbody>
            {staff.map((s) => (
              <Tr key={s.id}>
                <Td className="font-medium text-slate-900">{s.name}</Td>
                <Td>{s.designation}</Td>
                <Td>{s.department || "-"}</Td>
                <Td>{s.phone || "-"}</Td>
                <Td>
                  <Badge tone={s.isActive ? "green" : "slate"}>
                    {s.isActive ? "Active" : "Inactive"}
                  </Badge>
                </Td>
                <Td>
                  <Link href={`/staff/${s.id}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
                    View
                  </Link>
                </Td>
              </Tr>
            ))}
            {staff.length === 0 && (
              <EmptyRow colSpan={6}>Koi staff add nahi kiya abhi</EmptyRow>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
