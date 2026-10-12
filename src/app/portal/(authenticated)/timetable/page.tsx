import { getPortalSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

export const instant = false;

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function PortalTimetablePage() {
  const session = await getPortalSession();
  const student = await prisma.student.findUnique({
    where: { id: session!.studentId },
    select: { sectionId: true },
  });

  const entries = student?.sectionId
    ? await prisma.timetableEntry.findMany({
        where: { sectionId: student.sectionId },
        include: { subject: true },
        orderBy: [{ dayOfWeek: "asc" }, { periodNumber: "asc" }],
      })
    : [];

  const byDay = DAYS.map((label, i) => ({
    label,
    entries: entries.filter((e) => e.dayOfWeek === i),
  })).filter((d) => d.entries.length > 0);

  return (
    <div>
      <PageHeader title="Timetable" description="Your weekly class schedule" />
      {byDay.length === 0 ? (
        <Card><div className="p-5 text-sm text-slate-400">Timetable abhi set nahi hui</div></Card>
      ) : (
        <div className="space-y-3">
          {byDay.map((d) => (
            <Card key={d.label}>
              <div className="p-4">
                <p className="text-sm font-semibold text-slate-800 mb-2">{d.label}</p>
                <ul className="space-y-1.5">
                  {d.entries.map((e) => (
                    <li key={e.id} className="text-sm flex items-center justify-between text-slate-600">
                      <span>
                        Period {e.periodNumber} &middot; {e.subject?.name || "-"}
                      </span>
                      <span className="text-xs text-slate-400">
                        {e.startTime} - {e.endTime}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
