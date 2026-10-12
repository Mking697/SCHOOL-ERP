import { redirect } from "next/navigation";
import { connection } from "next/server";
import { prisma } from "@/lib/db";
import { getPortalSession } from "@/lib/portal-auth";
import PortalLoginForm from "./portal-login-form";

export const instant = false;

export default async function PortalLoginPage() {
  await connection();
  const existing = await getPortalSession();
  if (existing) redirect("/portal");

  const school = await prisma.school.findFirst();
  return (
    <PortalLoginForm schoolName={school?.name || "School Portal"} logoUrl={school?.logoUrl || null} />
  );
}
