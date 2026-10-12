import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDriverSession } from "@/lib/driver-auth";

// Called by the Driver App every time the browser's Geolocation API reports
// a new position. Scoped to the logged-in driver's OWN route only.
export async function POST(req: NextRequest) {
  const session = await getDriverSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lat, lng } = await req.json();
  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "lat/lng required" }, { status: 400 });
  }

  await prisma.transportRoute.update({
    where: { id: session.routeId },
    data: { currentLat: lat, currentLng: lng, locationUpdatedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
