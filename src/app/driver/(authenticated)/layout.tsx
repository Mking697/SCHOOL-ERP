import { redirect } from "next/navigation";
import { getDriverSession } from "@/lib/driver-auth";
import { prisma } from "@/lib/db";

export const instant = false;

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const session = await getDriverSession();
  if (!session) redirect("/driver/login");

  const route = await prisma.transportRoute.findUnique({ where: { id: session.routeId } });
  if (!route) redirect("/driver/login");

  return <>{children}</>;
}
