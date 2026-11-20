"use client";

import { Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToCsv, exportToExcel, type ExportColumn } from "@/lib/export";

/**
 * Drop-in "Export Excel" / "Export CSV" button pair for any list/table page.
 * Pass the exact rows currently loaded/filtered on screen -- this component
 * never fetches its own data, so it can never leak more than the page
 * already shows to the current logged-in user.
 */
export default function ExportButtons<T>({
  data,
  columns,
  filename,
  sheetName,
  size = "sm",
  disabled,
}: {
  data: T[];
  columns: ExportColumn<T>[];
  filename: string;
  sheetName?: string;
  size?: "sm" | "md";
  disabled?: boolean;
}) {
  const isDisabled = disabled ?? data.length === 0;
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="secondary"
        size={size}
        disabled={isDisabled}
        onClick={() => exportToExcel(data, columns, filename, sheetName)}
      >
        <FileSpreadsheet className="w-3.5 h-3.5" />
        Export Excel
      </Button>
      <Button
        type="button"
        variant="secondary"
        size={size}
        disabled={isDisabled}
        onClick={() => exportToCsv(data, columns, filename)}
      >
        <Download className="w-3.5 h-3.5" />
        Export CSV
      </Button>
    </div>
  );
}
