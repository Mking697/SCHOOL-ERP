"use client";

/**
 * Shared row-export utility used across every module's list page.
 *
 * Exports only the rows/columns handed to it by the caller -- callers are
 * responsible for already having scoped those rows to whatever the current
 * logged-in user/installation is allowed to see (the existing Prisma
 * queries / fetch calls on each page already do this; this file never
 * fetches data itself).
 */
import * as XLSX from "xlsx";

export type ExportColumn<T> = {
  /** Column header shown in the exported file. */
  header: string;
  /** Extracts the cell value for a row. */
  value: (row: T) => string | number | boolean | null | undefined;
};

function buildAoa<T>(rows: T[], columns: ExportColumn<T>[]): (string | number | boolean | "")[][] {
  const header = columns.map((c) => c.header);
  const body = rows.map((row) =>
    columns.map((c) => {
      const v = c.value(row);
      return v === null || v === undefined ? "" : v;
    })
  );
  return [header, ...body];
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Downloads the given rows as a .xlsx workbook (single sheet). */
export function exportToExcel<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  filenameBase: string,
  sheetName = "Sheet1"
) {
  const aoa = buildAoa(rows, columns);
  const worksheet = XLSX.utils.aoa_to_sheet(aoa);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31) || "Sheet1");
  const data = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  triggerDownload(
    new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `${filenameBase}.xlsx`
  );
}

function csvEscape(value: string | number | boolean | ""): string {
  const s = String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Downloads the given rows as a .csv file. */
export function exportToCsv<T>(rows: T[], columns: ExportColumn<T>[], filenameBase: string) {
  const aoa = buildAoa(rows, columns);
  const csv = aoa.map((line) => line.map(csvEscape).join(",")).join("\r\n");
  // Prepend UTF-8 BOM so Excel opens non-ASCII (e.g. ₹, names) correctly.
  triggerDownload(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" }), `${filenameBase}.csv`);
}
