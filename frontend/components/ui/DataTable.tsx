import React from "react";
import { cn } from "@/lib/utils/cn";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  className?: string;
  render: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  emptyMessage?: string;
  className?: string;
  compact?: boolean;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = "No records found.",
  className,
  compact = false,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-space-800 bg-space-900 p-8 text-center text-xs text-fg-muted shadow-panel">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-space-800 bg-space-900 shadow-panel overflow-hidden",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-space-800 bg-brand-soft/80 dark:bg-space-950/80 text-fg-muted">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    compact ? "px-3 py-2.5" : "px-4 py-3.5",
                    "font-semibold whitespace-nowrap text-[11px] uppercase tracking-wider",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-space-800">
            {rows.map((row, idx) => (
              <tr
                key={rowKey(row, idx)}
                className="hover:bg-brand-soft/45 dark:hover:bg-space-800/40 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      compact ? "px-3 py-2.5" : "px-4 py-3.5",
                      "text-fg-primary align-top",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.className
                    )}
                  >
                    {col.render(row, idx)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
