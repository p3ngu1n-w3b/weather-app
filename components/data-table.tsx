"use client";

import type { ReactNode } from "react";
import { cn } from "@/components/ui";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T extends { id: number }>({
  columns,
  rows,
  onRowClick,
  actions,
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  actions?: (row: T) => ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60">
            {columns.map((col, i) => (
              <th key={i} className={cn("px-4 py-3 font-semibold text-slate-500", col.className)}>
                {col.header}
              </th>
            ))}
            {actions && <th className="px-4 py-3 text-right font-semibold text-slate-500">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                "border-b border-slate-50 transition-colors last:border-0",
                onRowClick && "cursor-pointer hover:bg-slate-50"
              )}
            >
              {columns.map((col, i) => (
                <td key={i} className={cn("px-4 py-3 text-slate-700", col.className)}>
                  {col.cell(row)}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">{actions(row)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RowAction({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md px-2 py-1 text-xs font-medium transition-colors",
        danger ? "text-red-600 hover:bg-red-50" : "text-slate-600 hover:bg-slate-100"
      )}
    >
      {label}
    </button>
  );
}
