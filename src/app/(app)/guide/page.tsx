import { getSession } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { GuideAccordion } from "@/components/guide-accordion";
import { STAFF_GUIDE } from "@/lib/guide-content";

export const instant = false;

export default async function GuidePage() {
  const session = await getSession();
  return (
    <div>
      <PageHeader
        title="Guide Book"
        description="Poora School ERP kaise use karein -- step by step, examples ke saath"
      />
      <GuideAccordion sections={STAFF_GUIDE} currentRole={session?.role} />
    </div>
  );
}
