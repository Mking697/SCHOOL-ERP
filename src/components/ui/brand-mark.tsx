import { GraduationCap } from "lucide-react";

// Small reusable school logo/fallback-icon used on printable documents
// (ID card, report card, invoice) and anywhere else a compact brand mark
// is needed.
export function BrandMark({
  logoUrl,
  schoolName,
  className = "w-4 h-4",
}: {
  logoUrl?: string | null;
  schoolName?: string;
  className?: string;
}) {
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt={schoolName || "School logo"} className={`${className} object-contain`} />;
  }
  return <GraduationCap className={className} />;
}
