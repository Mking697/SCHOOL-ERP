import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import StudentExtras from "./student-extras";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IdCard, ArrowLeft } from "lucide-react";

export const instant = false;

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      section: { include: { classLevel: true } },
      behaviorRecords: { orderBy: { createdAt: "desc" } },
      achievements: { orderBy: { date: "desc" } },
    },
  });

  if (!student) notFound();

  return (
    <div>
      <PageHeader
        title={`${student.firstName} ${student.lastName}`}
        actions={
          <>
            <Link href={`/students/${student.id}/id-card`}>
              <Button variant="secondary">
                <IdCard className="w-4 h-4" />
                ID Card
              </Button>
            </Link>
            <Link href="/students">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4" />
                Back to list
              </Button>
            </Link>
          </>
        }
      />

      <Card className="max-w-2xl">
        <CardBody>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Admission No</p>
              <p className="font-medium text-slate-900">{student.admissionNo}</p>
            </div>
            <div>
              <p className="text-slate-500">Class</p>
              <p className="font-medium text-slate-900">
                {student.section
                  ? `${student.section.classLevel.name} - ${student.section.name}`
                  : "Not assigned"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Date of Birth</p>
              <p className="font-medium text-slate-900">
                {student.dob ? new Date(student.dob).toLocaleDateString() : "-"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Gender</p>
              <p className="font-medium text-slate-900">{student.gender || "-"}</p>
            </div>
            <div>
              <p className="text-slate-500">Guardian</p>
              <p className="font-medium text-slate-900">{student.guardianName || "-"}</p>
            </div>
            <div>
              <p className="text-slate-500">Guardian Phone</p>
              <p className="font-medium text-slate-900">{student.guardianPhone || "-"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-500">Address</p>
              <p className="font-medium text-slate-900">{student.address || "-"}</p>
            </div>
            <div>
              <p className="text-slate-500">Admitted On</p>
              <p className="font-medium text-slate-900">
                {new Date(student.admittedAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Status</p>
              <p className="font-medium">
                <Badge tone={student.isActive ? "green" : "slate"}>
                  {student.isActive ? "Active" : "Inactive"}
                </Badge>
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <StudentExtras
        studentId={student.id}
        behaviorRecords={student.behaviorRecords.map((b) => ({
          id: b.id,
          type: b.type,
          category: b.category ?? undefined,
          description: b.description,
          createdAt: b.createdAt.toISOString(),
        }))}
        achievements={student.achievements.map((a) => ({
          id: a.id,
          title: a.title,
          category: a.category ?? undefined,
          date: a.date.toISOString(),
        }))}
      />
    </div>
  );
}
