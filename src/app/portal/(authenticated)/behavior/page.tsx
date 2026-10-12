import { getPortalSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Trophy } from "lucide-react";

export const instant = false;

export default async function PortalBehaviorPage() {
  const session = await getPortalSession();
  const [records, achievements] = await Promise.all([
    prisma.behaviorRecord.findMany({
      where: { studentId: session!.studentId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.achievement.findMany({
      where: { studentId: session!.studentId },
      orderBy: { date: "desc" },
    }),
  ]);

  return (
    <div className="space-y-5">
      <PageHeader title="Behavior & Achievements" description="Records from your teachers" />

      <Card>
        <CardHeader>
          <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            Achievements
          </p>
        </CardHeader>
        <CardBody>
          {achievements.length === 0 ? (
            <p className="text-sm text-slate-400">Koi achievement record nahi hai</p>
          ) : (
            <ul className="space-y-3">
              {achievements.map((a) => (
                <li key={a.id} className="flex items-start gap-2">
                  <Trophy className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{a.title}</p>
                    <p className="text-xs text-slate-500">
                      {a.category || "General"} &middot; {new Date(a.date).toLocaleDateString()}
                    </p>
                    {a.description && <p className="text-xs text-slate-500 mt-0.5">{a.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <p className="text-sm font-semibold text-slate-800">Behavior Records</p>
        </CardHeader>
        <CardBody>
          {records.length === 0 ? (
            <p className="text-sm text-slate-400">Koi behavior record nahi hai</p>
          ) : (
            <ul className="space-y-3">
              {records.map((r) => (
                <li key={r.id} className="flex items-start gap-2">
                  {r.type === "POSITIVE" ? (
                    <ThumbsUp className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <ThumbsDown className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-800">{r.description}</p>
                    <p className="text-xs text-slate-500">
                      {r.category || "General"} &middot; {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
