import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import ActivateLicenseForm from "./activate-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const instant = false;

export default async function LicensePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const school = await prisma.school.findFirst({ include: { license: true } });
  const license = school?.license;

  const isExpired = license?.expiresAt ? new Date(license.expiresAt) < new Date() : false;
  const isActive = license?.isActive && !isExpired;

  return (
    <div>
      <PageHeader title="License" description="View and manage your school's license." />

      <Card className="max-w-md mb-6">
        <CardBody>
          {license ? (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-slate-500">Status:</span>{" "}
                <Badge tone={isActive ? "green" : "red"}>
                  {isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
                </Badge>
              </p>
              <p>
                <span className="text-slate-500">Plan:</span> {license.plan}
              </p>
              <p>
                <span className="text-slate-500">Activated:</span>{" "}
                {new Date(license.activatedAt).toLocaleDateString()}
              </p>
              <p>
                <span className="text-slate-500">Expires:</span>{" "}
                {license.expiresAt
                  ? new Date(license.expiresAt).toLocaleDateString()
                  : "Perpetual"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Koi license activate nahi hui abhi. School vendor se license key le kar
              neeche activate karo.
            </p>
          )}
        </CardBody>
      </Card>

      {session.role === "SUPER_ADMIN" && <ActivateLicenseForm />}
    </div>
  );
}
