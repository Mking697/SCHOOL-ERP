import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { verifyLicenseKey } from "@/lib/license";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const school = await prisma.school.findFirst({ include: { license: true } });
  return NextResponse.json({ license: school?.license || null });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { licenseKey } = await req.json();
  if (!licenseKey) {
    return NextResponse.json({ error: "licenseKey required" }, { status: 400 });
  }

  const result = verifyLicenseKey(licenseKey);
  if (!result.valid) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const school = await prisma.school.findFirst();
  if (!school) {
    return NextResponse.json({ error: "School record not found" }, { status: 500 });
  }

  const license = await prisma.license.upsert({
    where: { schoolId: school.id },
    create: {
      schoolId: school.id,
      licenseKey,
      plan: result.payload.plan,
      expiresAt: result.payload.expiresAt ? new Date(result.payload.expiresAt) : null,
      isActive: true,
    },
    update: {
      licenseKey,
      plan: result.payload.plan,
      expiresAt: result.payload.expiresAt ? new Date(result.payload.expiresAt) : null,
      isActive: true,
      activatedAt: new Date(),
    },
  });

  return NextResponse.json(license);
}
