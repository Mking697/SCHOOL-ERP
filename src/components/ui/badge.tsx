import { HTMLAttributes } from "react";

type Tone = "slate" | "indigo" | "green" | "yellow" | "red" | "blue";

const toneClasses: Record<Tone, string> = {
  slate: "bg-slate-100 text-slate-700",
  indigo: "bg-indigo-100 text-indigo-700",
  green: "bg-emerald-100 text-emerald-700",
  yellow: "bg-amber-100 text-amber-800",
  red: "bg-rose-100 text-rose-700",
  blue: "bg-sky-100 text-sky-700",
};

export function Badge({
  tone = "slate",
  className = "",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]} ${className}`}
      {...props}
    />
  );
}

// Convenience mapper for the many STATUS-like enum strings used across the
// app (PENDING/APPROVED/PAID/...). Falls back to slate for unknown values.
export function statusTone(status: string): Tone {
  const positive = ["APPROVED", "PAID", "DONE", "RESOLVED", "ACTIVE", "PRESENT", "RETURNED", "ADMITTED"];
  const warning = ["PENDING", "IN_PROGRESS", "PARTIAL", "FOLLOW_UP", "LATE", "HALF_DAY", "NEW", "OPEN"];
  const negative = ["REJECTED", "ABSENT", "OVERDUE", "CANCELLED", "CLOSED", "INACTIVE"];
  if (positive.includes(status)) return "green";
  if (warning.includes(status)) return "yellow";
  if (negative.includes(status)) return "red";
  return "slate";
}
