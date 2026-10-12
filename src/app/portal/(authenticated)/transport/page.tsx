import { getPortalSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Bus, MapPin } from "lucide-react";

export const instant = false;

export default async function PortalTransportPage() {
  const session = await getPortalSession();
  const student = await prisma.student.findUnique({
    where: { id: session!.studentId },
    include: { route: { include: { stops: { orderBy: { order: "asc" } } } } },
  });

  const route = student?.route;
  const minutesAgo = route?.locationUpdatedAt
    ? Math.round((Date.now() - new Date(route.locationUpdatedAt).getTime()) / 60000)
    : null;
  const isLive = minutesAgo !== null && minutesAgo < 15;

  return (
    <div>
      <PageHeader title="My Bus" description="Live location of your school transport" />
      {!route ? (
        <Card>
          <CardBody>
            <p className="text-sm text-slate-400">
              Koi transport route assign nahi hai. School office se contact karo.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardBody>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{route.name}</p>
                  <p className="text-sm text-slate-500">
                    {route.vehicleNumber || "-"} &middot; {route.driverName || "-"}
                  </p>
                </div>
              </div>
              {route.currentLat && route.currentLng ? (
                <>
                  <p
                    className={`text-sm flex items-center gap-1 mt-3 ${
                      isLive ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    {isLive ? "Live" : "Last known location"} &middot;{" "}
                    {minutesAgo !== null ? `${minutesAgo} min ago` : ""}
                  </p>
                  <div className="mt-3 rounded-xl overflow-hidden border border-slate-200">
                    <iframe
                      title="Bus location"
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      loading="lazy"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                        route.currentLng - 0.01
                      }%2C${route.currentLat - 0.01}%2C${route.currentLng + 0.01}%2C${
                        route.currentLat + 0.01
                      }&layer=mapnik&marker=${route.currentLat}%2C${route.currentLng}`}
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400 mt-3">
                  Driver ne abhi trip start nahi ki -- location yahan dikhegi jab bus chalegi.
                </p>
              )}
            </CardBody>
          </Card>

          {route.stops.length > 0 && (
            <Card>
              <CardBody>
                <p className="text-sm font-semibold text-slate-800 mb-2">Stops</p>
                <ol className="space-y-1.5">
                  {route.stops.map((s, i) => (
                    <li key={s.id} className="text-sm flex items-center gap-2 text-slate-600">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-medium">
                        {i + 1}
                      </span>
                      {s.name}
                    </li>
                  ))}
                </ol>
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
