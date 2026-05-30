"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { getServicesHealth, type ServiceHealth } from "@/lib/api";

type LoadState = "loading" | "ready" | "error";

export default function HealthPage() {
  const [items, setItems] = useState<ServiceHealth[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadHealth = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await getServicesHealth();
      setItems(response.items);
      setState("ready");
      setError("");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Service health gagal dimuat");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  const totals = useMemo(
    () => ({
      services: items.length,
      routes: items.reduce((sum, item) => sum + item.routes, 0)
    }),
    [items]
  );

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase text-success">Status</p>
          <h2 className="mt-1 text-2xl font-semibold">Service Health</h2>
        </div>
        <button
          type="button"
          onClick={loadHealth}
          disabled={refreshing}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-success/50 hover:text-success disabled:cursor-not-allowed disabled:opacity-50"
        >
          {refreshing ? "Memuat..." : "Refresh"}
        </button>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric label="Configured Services" value={String(totals.services)} loading={state === "loading"} />
        <Metric label="Registered Routes" value={String(totals.routes)} loading={state === "loading"} />
        <Metric label="Probe Mode" value="Read-only" loading={state === "loading"} muted />
      </section>

      {state === "error" && <div className="mt-5 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-red-200">{error}</div>}

      <section className="mt-5 grid gap-4 xl:grid-cols-3">
        {state === "loading" ? (
          Array.from({ length: 6 }).map((_, index) => <ServiceSkeleton key={index} />)
        ) : items.length === 0 ? (
          <div className="xl:col-span-3"><EmptyState title="Belum ada service" description="Service akan muncul setelah route registry tersedia." /></div>
        ) : (
          items.map((service) => <ServiceCard key={service.service_name} service={service} />)
        )}
      </section>
    </AppShell>
  );
}

function ServiceCard({ service }: { service: ServiceHealth }) {
  return (
    <article className="rounded-lg border border-slate-800 bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase text-slate-500">{service.service_name}</p>
          <h3 className="mt-1 text-lg font-semibold">{service.status}</h3>
        </div>
        <span className="rounded-md border border-success/30 bg-success/10 px-2 py-1 text-xs text-green-300">
          Configured
        </span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <MiniMetric label="Routes" value={String(service.routes)} />
        <MiniMetric label="Circuit" value={service.circuit_state} />
        <MiniMetric label="Latency" value="-" />
      </div>
      <button
        type="button"
        disabled
        className="mt-5 w-full rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Force Probe disabled
      </button>
    </article>
  );
}

function Metric({ label, value, loading, muted = false }: { label: string; value: string; loading: boolean; muted?: boolean }) {
  return (
    <article className="rounded-lg border border-slate-800 bg-surface p-5">
      <p className="text-xs uppercase text-text-secondary">{label}</p>
      {loading ? <div className="mt-4 h-8 w-24 animate-pulse rounded bg-slate-800" /> : <p className={`mt-3 text-3xl font-semibold ${muted ? "text-slate-400" : "text-text-primary"}`}>{value}</p>}
    </article>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="mt-1 truncate font-mono text-xs text-slate-200">{value}</p>
    </div>
  );
}

function ServiceSkeleton() {
  return (
    <article className="rounded-lg border border-slate-800 bg-surface p-5">
      <div className="h-4 w-28 animate-pulse rounded bg-slate-800" />
      <div className="mt-4 h-8 w-40 animate-pulse rounded bg-slate-800" />
      <div className="mt-5 h-20 animate-pulse rounded bg-slate-800" />
    </article>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid min-h-[320px] place-items-center rounded-lg border border-slate-800 bg-surface px-6 text-center">
      <div>
        <p className="text-sm font-medium text-slate-300">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}
