import { TableHTMLAttributes, HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";

export function Table({ className = "", ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-sm ${className}`} {...props} />
    </div>
  );
}

export function Thead({ className = "", ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={`bg-slate-50 ${className}`} {...props} />;
}

export function Th({ className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${className}`}
      {...props}
    />
  );
}

export function Td({ className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-4 py-3 text-slate-700 ${className}`} {...props} />;
}

export function Tr({ className = "", ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={`border-t border-slate-100 hover:bg-slate-50/60 transition-colors ${className}`} {...props} />;
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-slate-400">
        {children}
      </td>
    </tr>
  );
}
