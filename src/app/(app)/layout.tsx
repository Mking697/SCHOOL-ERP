import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { checkSubscription } from "@/lib/subscription";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import SubscriptionGate from "@/components/subscription-gate";
import { RenewalBanner } from "@/components/renewal-banner";

export const instant = false;

const RENEWAL_ALERT_ROLES = ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTANT"];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const school = await prisma.school.findFirst({ include: { license: true } });
  const license = school?.license;
  const isExpired = license?.expiresAt ? new Date(license.expiresAt) < new Date() : false;
  const licensed = Boolean(license?.isActive && !isExpired);

  // Hard block: only if a central Vendor/Billing Server is configured
  // AND it explicitly confirms the subscription is inactive. Schools not
  // wired up to central billing (VENDOR_SERVER_URL/SCHOOL_API_KEY unset)
  // are entirely unaffected by this -- they keep using the offline
  // license system above.
  const subscription = await checkSubscription();
  if (subscription && !subscription.active) {
    return <SubscriptionGate schoolName={school?.name || "Your School"} pricingTier={subscription.pricingTier} />;
  }

  // Soft heads-up: 3 days before expiry (not a hard block), only shown to
  // the roles who can actually act on it -- avoids surprising a Teacher or
  // Librarian with a billing banner they have no power to resolve.
  const showRenewalBanner = Boolean(
    subscription && subscription.active && subscription.daysLeft <= 3 && RENEWAL_ALERT_ROLES.includes(session.role)
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="print:hidden">
        <Sidebar schoolName={school?.name || "School ERP"} logoUrl={school?.logoUrl || null} role={session.role} />
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="print:hidden">
          <Topbar
            schoolName={school?.name || "School ERP"}
            userEmail={session.email}
            userRole={session.role}
            licensed={licensed || subscription?.active === true}
          />
        </div>
        {showRenewalBanner && subscription && (
          <RenewalBanner
            schoolName={school?.name || "Your School"}
            daysLeft={subscription.daysLeft}
            currentPeriodEnd={subscription.currentPeriodEnd}
            pricingTier={subscription.pricingTier}
          />
        )}
        <main className="flex-1 p-4 lg:p-8 print:p-0">{children}</main>
      </div>
    </div>
  );
}
