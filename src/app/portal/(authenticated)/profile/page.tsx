import { getPortalSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import Link from "next/link";
import { IdCard } from "lucide-react";

export const instant = false;

export default async function PortalProfilePage() {
  const session = await getPortalSession();
  const student = await prisma.student.findUnique({
    where: { id: session!.studentId },
    include: { section: { include: { classLevel: true } } },
  });

  const rows: [string, string][] = [
    ["Admission No.", student?.admissionNo || "-"],
    ["Name", `${student?.firstName} ${student?.lastName}`],
    ["Class", student?.section ? `${student.section.classLevel.name} - ${student.section.name}` : "-"],
    ["Date of Birth", student?.dob ? new Date(student.dob).toLocaleDateString() : "-"],
    ["Gender", student?.gender || "-"],
    ["Guardian Name", student?.guardianName || "-"],
    ["Guardian Phone", student?.guardianPhone || "-"],
    ["Address", student?.address || "-"],
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Profile" description="Your student record on file" />
      <Card>
        <CardBody>
          <dl className="divide-y divide-slate-100">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 text-sm">
                <dt className="text-slate-500">{label}</dt>
                <dd className="text-slate-800 font-medium text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>
      <Link
        href={`/students/${student?.id}/id-card`}
        className="inline-flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-4 py-2"
      >
        <IdCard className="w-4 h-4" />
        View / Print ID Card
      </Link>
    </div>
  );
}
