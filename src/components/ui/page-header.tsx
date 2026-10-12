export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  tone = "indigo",
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  tone?: "indigo" | "emerald" | "amber" | "rose" | "sky";
}) {
  const toneBg: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    sky: "bg-sky-50 text-sky-700",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      {sub && (
        <span
          className={`inline-block mt-2 text-xs font-medium rounded-full px-2 py-0.5 ${toneBg[tone]}`}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-14 px-6 bg-white rounded-xl border border-dashed border-slate-300">
      <p className="text-sm font-medium text-slate-600">{title}</p>
      {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
