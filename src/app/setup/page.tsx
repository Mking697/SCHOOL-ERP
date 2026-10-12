import { redirect } from "next/navigation";
import { connection } from "next/server";
import { prisma } from "@/lib/db";
import SetupWizardForm from "./setup-wizard-form";

export const instant = false;

export default async function SetupPage() {
  await connection();
  // Guard: once a School row exists, the install is already set up --
  // never let the wizard run again (it would let anyone mint a new
  // SUPER_ADMIN on a live school's install).
  const existing = await prisma.school.findFirst();
  if (existing) {
    redirect("/login");
  }

  return <SetupWizardForm />;
}
