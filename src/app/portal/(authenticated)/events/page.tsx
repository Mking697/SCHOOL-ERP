import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export const instant = false;

export default async function PortalEventsPage() {
  const events = await prisma.event.findMany({ orderBy: { eventDate: "desc" }, take: 30 });

  return (
    <div>
      <PageHeader title="Events" description="School calendar & events" />
      {events.length === 0 ? (
        <Card><CardBody><p className="text-sm text-slate-400">Koi event nahi hai</p></CardBody></Card>
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <Card key={e.id}>
              <CardBody>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{e.title}</p>
                    {e.description && <p className="text-sm text-slate-500">{e.description}</p>}
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(e.eventDate).toLocaleDateString()} {e.location ? `· ${e.location}` : ""}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
