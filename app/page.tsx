"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Card, Spinner } from "@/components/ui";
import { formatCurrency, relativeDueLabel, titleCase } from "@/lib/format";
import type { DashboardStats } from "@/lib/repo";

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent: string;
}) {
  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold tracking-tight ${accent}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load dashboard");
        return r.json();
      })
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!stats) return <Spinner />;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back 👋</h1>
        <p className="mt-1 text-sm text-slate-500">
          Here&apos;s what&apos;s happening across Creative Touch today.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Active Clients"
          value={String(stats.activeClients)}
          hint={`${stats.totalClients} total`}
          accent="text-slate-900"
        />
        <StatCard
          label="Open Projects"
          value={String(stats.openProjects)}
          hint={`${stats.openTasks} open tasks`}
          accent="text-sky-600"
        />
        <StatCard
          label="Revenue (Paid)"
          value={formatCurrency(stats.revenuePaid)}
          hint="From paid invoices"
          accent="text-emerald-600"
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(stats.revenueOutstanding)}
          hint="Sent + overdue"
          accent="text-amber-600"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <p className="text-sm font-medium text-slate-500">Sales Pipeline</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-violet-600">
            {formatCurrency(stats.pipelineValue)}
          </p>
          <p className="mt-1 text-xs text-slate-400">Open leads (new, contacted, proposal)</p>
          <Link
            href="/leads"
            className="mt-4 inline-block text-sm font-medium text-rose-600 hover:text-rose-700"
          >
            View pipeline →
          </Link>
        </Card>

        <Card className="p-5">
          <p className="mb-3 text-sm font-semibold text-slate-700">Projects by status</p>
          <BarList data={stats.projectsByStatus} />
        </Card>

        <Card className="p-5">
          <p className="mb-3 text-sm font-semibold text-slate-700">Invoices by status</p>
          <BarList data={stats.invoicesByStatus} />
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Upcoming tasks</p>
            <Link href="/tasks" className="text-xs font-medium text-rose-600 hover:text-rose-700">
              All tasks
            </Link>
          </div>
          {stats.upcomingTasks.length === 0 ? (
            <p className="text-sm text-slate-400">No open tasks.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {stats.upcomingTasks.map((t) => {
                const due = relativeDueLabel(t.due_date);
                return (
                  <li key={t.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-700">{t.title}</p>
                      <p className="truncate text-xs text-slate-400">
                        {t.project_name ?? "No project"}
                        {t.assignee_name ? ` · ${t.assignee_name}` : ""}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-medium ${
                        due.tone === "overdue"
                          ? "text-red-600"
                          : due.tone === "soon"
                            ? "text-amber-600"
                            : "text-slate-400"
                      }`}
                    >
                      {due.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Recent leads</p>
            <Link href="/leads" className="text-xs font-medium text-rose-600 hover:text-rose-700">
              All leads
            </Link>
          </div>
          {stats.recentLeads.length === 0 ? (
            <p className="text-sm text-slate-400">No leads yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {stats.recentLeads.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700">{l.company || l.name}</p>
                    <p className="truncate text-xs text-slate-400">{l.service_interest}</p>
                  </div>
                  <Badge status={l.stage} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Upcoming posts</p>
            <Link href="/content" className="text-xs font-medium text-rose-600 hover:text-rose-700">
              Calendar
            </Link>
          </div>
          {stats.upcomingPosts.length === 0 ? (
            <p className="text-sm text-slate-400">Nothing scheduled.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {stats.upcomingPosts.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700">{p.title}</p>
                    <p className="truncate text-xs text-slate-400">
                      {p.platform} · {p.client_name}
                    </p>
                  </div>
                  <Badge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function BarList({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return <p className="text-sm text-slate-400">No data.</p>;
  const max = Math.max(...entries.map(([, v]) => v), 1);
  return (
    <ul className="flex flex-col gap-2.5">
      {entries.map(([key, value]) => (
        <li key={key} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-xs capitalize text-slate-500">{titleCase(key)}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-rose-400"
              style={{ width: `${(value / max) * 100}%` }}
            />
          </div>
          <span className="w-5 shrink-0 text-right text-xs font-medium text-slate-600">{value}</span>
        </li>
      ))}
    </ul>
  );
}
