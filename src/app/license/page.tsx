import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import ActivateLicenseForm from "./activate-form";

export const instant = false;

export default async function LicensePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const school = await prisma.school.findFirst({ include: { license: true } });
  const license = school?.license;

  const isExpired = license?.expiresAt ? new Date(license.expiresAt) < new Date() : false;
  const isActive = license?.isActive && !isExpired;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">License</h1>

      <div className="bg-white rounded-lg shadow p-6 max-w-md mb-6">
        {license ? (
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-500">Status:</span>{" "}
              {isActive ? (
                <span className="text-green-700 font-medium">Active</span>
              ) : (
                <span className="text-red-600 font-medium">
                  {isExpired ? "Expired" : "Inactive"}
                </span>
              )}
            </p>
            <p>
              <span className="text-gray-500">Plan:</span> {license.plan}
            </p>
            <p>
              <span className="text-gray-500">Activated:</span>{" "}
              {new Date(license.activatedAt).toLocaleDateString()}
            </p>
            <p>
              <span className="text-gray-500">Expires:</span>{" "}
              {license.expiresAt
                ? new Date(license.expiresAt).toLocaleDateString()
                : "Perpetual"}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Koi license activate nahi hui abhi. School vendor se license key le kar
            neeche activate karo.
          </p>
        )}
      </div>

      {session.role === "SUPER_ADMIN" && <ActivateLicenseForm />}
    </div>
  );
}
