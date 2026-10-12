import { redirect } from "next/navigation";
import { connection } from "next/server";
import { prisma } from "@/lib/db";
import { getDriverSession } from "@/lib/driver-auth";
import DriverLoginForm from "./driver-login-form";

export const instant = false;

export default async function DriverLoginPage() {
  await connection();
  const existing = await getDriverSession();
  if (existing) redirect("/driver");

  const school = await prisma.school.findFirst();
  return <DriverLoginForm schoolName={school?.name || "School Transport"} />;
}
