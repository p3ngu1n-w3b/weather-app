export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function titleCase(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function relativeDueLabel(value: string | null | undefined): {
  label: string;
  tone: "overdue" | "soon" | "normal" | "none";
} {
  if (!value) return { label: "No date", tone: "none" };
  const due = new Date(value);
  if (Number.isNaN(due.getTime())) return { label: "No date", tone: "none" };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, tone: "overdue" };
  if (diff === 0) return { label: "Due today", tone: "soon" };
  if (diff <= 3) return { label: `Due in ${diff}d`, tone: "soon" };
  return { label: formatDate(value), tone: "normal" };
}
