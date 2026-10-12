import { redirect } from "next/navigation";
import { connection } from "next/server";
import { prisma } from "@/lib/db";

export const instant = false;

export default async function Home() {
  await connection();
  const school = await prisma.school.findFirst();
  redirect(school ? "/dashboard" : "/setup");
}
