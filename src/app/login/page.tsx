import { redirect } from "next/navigation";
import { connection } from "next/server";
import { prisma } from "@/lib/db";
import LoginForm from "./login-form";

export const instant = false;

export default async function LoginPage() {
  await connection();
  const school = await prisma.school.findFirst();
  if (!school) {
    redirect("/setup");
  }
  return <LoginForm schoolName={school.name} logoUrl={school.logoUrl} />;
}
