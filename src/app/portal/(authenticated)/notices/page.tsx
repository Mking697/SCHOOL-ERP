import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/page-header";

export const instant = false;

export default async function PortalNoticesPage() {
  const notices = await prisma.notice.findMany({
    where: { audience: { in: ["ALL", "PARENTS", "STUDENTS"] } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <PageHeader title="Notices" description="Announcements from school" />
      {notices.length === 0 ? (
        <EmptyState title="Koi notice nahi hai" />
      ) : (
        <div className="space-y-3">
          {notices.map((n) => (
            <Card key={n.id}>
              <CardBody>
                <p className="font-medium text-slate-900">{n.title}</p>
                <p className="text-sm text-slate-600 mt-1">{n.body}</p>
                <p className="text-xs text-slate-400 mt-2">
                  {new Date(n.createdAt).toLocaleDateString()}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
