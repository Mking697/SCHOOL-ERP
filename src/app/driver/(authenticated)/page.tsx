import { getDriverSession } from "@/lib/driver-auth";
import { prisma } from "@/lib/db";
import DriverDashboard from "./driver-dashboard";

export const instant = false;

export default async function DriverHome() {
  const session = await getDriverSession();
  const route = await prisma.transportRoute.findUnique({
    where: { id: session!.routeId },
    include: { stops: { orderBy: { order: "asc" } } },
  });

  return <DriverDashboard route={route!} />;
}
