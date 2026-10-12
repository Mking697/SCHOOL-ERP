import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import StaffActions from "./staff-actions";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";

export const instant = false;

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const staff = await prisma.staff.findUnique({
    where: { id },
    include: {
      leaveRequests: { orderBy: { appliedAt: "desc" } },
      workAssignments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!staff) notFound();

  return (
    <div>
      <PageHeader
        title={staff.name}
        description={`${staff.designation}${staff.department ? ` - ${staff.department}` : ""}`}
      />

      <Card className="max-w-2xl mb-6">
        <CardBody>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <p>
              <span className="text-slate-500">Phone:</span> {staff.phone || "-"}
            </p>
            <p>
              <span className="text-slate-500">Email:</span> {staff.email || "-"}
            </p>
            <p>
              <span className="text-slate-500">Joining Date:</span>{" "}
              {new Date(staff.joiningDate).toLocaleDateString()}
            </p>
            <p>
              <span className="text-slate-500">Salary:</span>{" "}
              {staff.salary ? `₹${Number(staff.salary).toFixed(2)}` : "-"}
            </p>
          </div>
        </CardBody>
      </Card>

      <StaffActions
        staffId={staff.id}
        leaveRequests={staff.leaveRequests.map((l) => ({
          id: l.id,
          fromDate: l.fromDate.toISOString(),
          toDate: l.toDate.toISOString(),
          reason: l.reason,
          status: l.status,
        }))}
        workAssignments={staff.workAssignments.map((w) => ({
          id: w.id,
          title: w.title,
          status: w.status,
          dueDate: w.dueDate ? w.dueDate.toISOString() : null,
        }))}
      />
    </div>
  );
}
