import { PageHeader } from "@/components/ui/page-header";
import { GuideAccordion } from "@/components/guide-accordion";
import { PORTAL_GUIDE } from "@/lib/portal-guide-content";

export const instant = false;

export default function PortalGuidePage() {
  return (
    <div>
      <PageHeader title="Guide Book" description="Portal kaise use karein -- step by step" />
      <GuideAccordion sections={PORTAL_GUIDE} />
    </div>
  );
}
