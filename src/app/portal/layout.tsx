import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/db";
import PortalChrome from "./portal-chrome";

export const instant = false;

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  const [student, school] = await Promise.all([
    prisma.student.findUnique({
      where: { id: session.studentId },
      include: { section: { include: { classLevel: true } } },
    }),
    prisma.school.findFirst(),
  ]);

  if (!student || !student.isActive) redirect("/portal/login");

  return (
    <PortalChrome
      schoolName={school?.name || "School Portal"}
      logoUrl={school?.logoUrl || null}
      studentName={`${student.firstName} ${student.lastName}`}
      className={
        student.section
          ? `${student.section.classLevel.name} - ${student.section.name}`
          : "-"
      }
    >
      {children}
    </PortalChrome>
  );
}
