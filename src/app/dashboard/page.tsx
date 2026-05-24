"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  getDashboardSummary,
  getDashboardThroughput,
  type DashboardSummary,
  type ThroughputPoint
} from "@/lib/api";

const fallbackSummary: DashboardSummary = {
  total_requests: 0,
  error_rate: 0,
  average_latency_ms: 0,
  fee_revenue: 0,
  pending_fees: 0,
  failed_fees: 0
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>(fallbackSummary);
  const [throughput, setThroughput] = useState<ThroughputPoint[]>([]);
  const [status, setStatus] = useState<"loading" | "live" | "fallback">("loading");
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    setRefreshing(true);
    try {
      const [nextSummary, nextThroughput] = await Promise.all([
        getDashboardSummary(),
        getDashboardThroughput()
      ]);
      setSummary(nextSummary);
      setThroughput(nextThroughput.items);
      setStatus("live");
      setLastFetched(new Date());
    } catch {
      setSummary(fallbackSummary);
      setThroughput([]);
      setStatus("fallback");
      setLastFetched(new Date());
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const errorRate = useMemo(
    () => `${(summary.error_rate * 100).toFixed(1)}%`,
    [summary.error_rate]
  );

  const maxCount = useMemo(
    () => Math.max(...throughput.map((p) => p.count), 1),
    [throughput]
  );

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase text-primary">Dashboard</p>
          <h2 className="mt-1 text-2xl font-semibold">Operational Overview</h2>
        </div>
        <div className="flex items-center gap-3">
          {lastFetched && (
            <span className="font-mono text-xs text-slate-600">
              {lastFetched.toLocaleTimeString("id-ID")}
            </span>
          )}
          <button
            id="dashboard-refresh-button"
            type="button"
            onClick={loadDashboard}
            disabled={refreshing || status === "loading"}
            className="flex items-center gap-2 rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={refreshing ? "animate-spin" : ""}
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            {refreshing ? "Memuat..." : "Refresh"}
          </button>
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Error banner */}
      {status === "fallback" && (
        <div className="mt-4 flex items-center gap-3 rounded-md border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-yellow-300">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>
            Backend tidak terjangkau. Menampilkan data fallback — klik{" "}
            <strong>Refresh</strong> untuk coba lagi.
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {status === "loading" ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <KpiCard
              label="Total Requests"
              value={summary.total_requests.toLocaleString("id-ID")}
            />
            <KpiCard label="Error Rate" value={errorRate} tone="danger" />
            <KpiCard
              label="Avg Latency"
              value={`${Math.round(summary.average_latency_ms)} ms`}
            />
            <KpiCard
              label="Fee Revenue"
              value={currency(summary.fee_revenue)}
              tone="monetary"
            />
          </>
        )}
      </section>

      {/* Charts Row */}
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        {/* Throughput chart */}
        <div className="rounded-lg border border-slate-800 bg-surface p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Throughput 24 Jam</h3>
              <p className="mt-0.5 text-xs text-text-secondary">
                Request per bucket waktu
              </p>
            </div>
            <p className="font-mono text-xs text-slate-600">
              {throughput.length} bucket
            </p>
          </div>
          <div className="mt-5 flex h-48 items-end gap-1 border-t border-slate-800 pt-4">
            {status === "loading" ? (
              <div className="flex h-full w-full items-end gap-1">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 animate-pulse rounded-t bg-slate-800"
                    style={{ height: `${30 + (i % 4) * 15}%` }}
                  />
                ))}
              </div>
            ) : throughput.length === 0 ? (
              <div className="grid h-full w-full place-items-center text-sm text-text-secondary">
                Belum ada request tercatat.
              </div>
            ) : (
              throughput.map((point) => (
                <div
                  key={point.bucket}
                  className="group relative min-w-2 flex-1 cursor-default rounded-t bg-primary/60 transition-colors duration-100 hover:bg-primary"
                  style={{
                    height: `${Math.max(4, (point.count / maxCount) * 100)}%`
                  }}
                >
                  <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-mono text-text-primary shadow-lg group-hover:block">
                    {point.bucket}: {point.count}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fee Queue */}
        <div className="rounded-lg border border-slate-800 bg-surface p-5">
          <h3 className="font-semibold">Fee Queue</h3>
          <p className="mt-0.5 text-xs text-text-secondary">
            Status SmartBank fee
          </p>
          {status === "loading" ? (
            <div className="mt-5 space-y-3">
              <div className="h-10 animate-pulse rounded-md bg-slate-800" />
              <div className="h-10 animate-pulse rounded-md bg-slate-800" />
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              <QueueRow label="Pending" value={summary.pending_fees} />
              <QueueRow label="Failed" value={summary.failed_fees} danger />
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({
  status
}: {
  status: "loading" | "live" | "fallback";
}) {
  const config = {
    live: {
      cls: "border-success/30 bg-success/10 text-green-400",
      label: "Live API"
    },
    loading: {
      cls: "border-slate-700 bg-slate-800 text-slate-400",
      label: "Memuat..."
    },
    fallback: {
      cls: "border-warning/30 bg-warning/10 text-yellow-400",
      label: "Mock fallback"
    }
  };
  const { cls, label } = config[status];
  return (
    <span
      className={`rounded-md border px-3 py-1.5 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

function KpiCard({
  label,
  value,
  tone = "default"
}: {
  label: string;
  value: string;
  tone?: "default" | "danger" | "monetary";
}) {
  const valueClass =
    tone === "danger"
      ? "text-danger"
      : tone === "monetary"
        ? "text-monetary"
        : "text-text-primary";

  return (
    <article className="rounded-lg border border-slate-800 bg-surface p-5">
      <p className="text-xs uppercase tracking-wide text-text-secondary">
        {label}
      </p>
      <p className={`mt-3 text-3xl font-semibold tabular-nums ${valueClass}`}>
        {value}
      </p>
    </article>
  );
}

function SkeletonCard() {
  return (
    <article className="rounded-lg border border-slate-800 bg-surface p-5">
      <div className="h-3 w-24 animate-pulse rounded bg-slate-800" />
      <div className="mt-4 h-8 w-32 animate-pulse rounded bg-slate-800" />
    </article>
  );
}

function QueueRow({
  label,
  value,
  danger = false
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950 px-4 py-3">
      <span className="text-sm text-text-secondary">{label}</span>
      <span
        className={`font-mono text-sm font-medium ${danger && value > 0 ? "text-danger" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function currency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
}
