"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { getConfigDefaults, type ConfigDefaults } from "@/lib/api";

const tabs = ["Umum", "Fee & Pajak", "Rate Limit", "Timeout & Retry", "Logging", "Circuit Breaker"] as const;
type Tab = (typeof tabs)[number];
type LoadState = "loading" | "ready" | "error";

export default function ConfigPage() {
  const [config, setConfig] = useState<ConfigDefaults | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Umum");
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadConfig = useCallback(async () => {
    setRefreshing(true);
    try {
      setConfig(await getConfigDefaults());
      setState("ready");
      setError("");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Konfigurasi gagal dimuat");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase text-warning">System</p>
          <h2 className="mt-1 text-2xl font-semibold">Konfigurasi</h2>
        </div>
        <div className="flex gap-2">
          <button disabled className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-500 disabled:cursor-not-allowed disabled:opacity-60">Save disabled</button>
          <button
            type="button"
            onClick={loadConfig}
            disabled={refreshing}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-warning/50 hover:text-warning disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing ? "Memuat..." : "Refresh"}
          </button>
        </div>
      </div>

      {state === "error" && <div className="mt-5 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-red-200">{error}</div>}

      <section className="mt-6 rounded-lg border border-slate-800 bg-surface">
        <div className="flex flex-wrap gap-1 border-b border-slate-800 px-3 pt-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-t-md px-4 py-2 text-xs ${activeTab === tab ? "bg-slate-900 text-warning" : "text-slate-500 hover:text-slate-200"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        {state === "loading" ? <Skeleton /> : config ? <ConfigContent config={config} tab={activeTab} /> : <EmptyState />}
      </section>
    </AppShell>
  );
}

function ConfigContent({ config, tab }: { config: ConfigDefaults; tab: Tab }) {
  const rows = rowsForTab(config, tab);
  return (
    <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <Detail key={row.label} label={row.label} value={row.value} />
      ))}
      <div className="md:col-span-2 xl:col-span-3 rounded-lg border border-warning/30 bg-warning/10 p-4">
        <p className="text-xs uppercase text-yellow-300">Read-only</p>
        <p className="mt-1 text-sm text-yellow-100">Sprint 7C hanya membaca konfigurasi runtime. Persistence config ditunda.</p>
      </div>
    </div>
  );
}

function rowsForTab(config: ConfigDefaults, tab: Tab) {
  if (tab === "Fee & Pajak") {
    return [
      { label: "Gateway Fee Rate", value: `${config.fee.rate * 100}%` },
      { label: "Revenue User", value: config.fee.revenue_user },
      { label: "Pajak Sistem", value: "2% (SmartBank responsibility)" }
    ];
  }
  if (tab === "Rate Limit") {
    return [
      { label: "Read / Minute", value: String(config.protection.read_rate_limit_per_minute) },
      { label: "Transactional / Minute", value: String(config.protection.transactional_rate_limit_per_minute) },
      { label: "Transaction Cooldown", value: `${config.protection.transaction_cooldown_seconds}s` },
      { label: "Daily Transaction Limit", value: `${config.protection.transaction_daily_limit} / user` }
    ];
  }
  if (tab === "Timeout & Retry") {
    return [
      { label: "SmartBank Timeout", value: `${config.smartbank.timeout_ms} ms` },
      { label: "SmartBank Mode", value: config.smartbank.mode },
      { label: "SmartBank Base URL", value: config.smartbank.base_url },
      { label: "Idempotency TTL", value: `${config.protection.idempotency_ttl_hours}h` }
    ];
  }
  if (tab === "Logging") {
    return [
      { label: "Lifecycle", value: config.logging.request_lifecycle.join(", ") },
      { label: "Body Storage", value: config.logging.body_storage },
      { label: "Persistence", value: config.logging.persistence }
    ];
  }
  if (tab === "Circuit Breaker") {
    return [
      { label: "Open Window", value: `${config.protection.circuit_open_seconds}s` },
      { label: "State Source", value: "in-memory" },
      { label: "Probe Mode", value: "automatic" }
    ];
  }
  return [
    { label: "App Name", value: config.app.name },
    { label: "Environment", value: config.app.env },
    { label: "Version", value: config.app.version },
    { label: "Port", value: config.app.port },
    { label: "CORS Origins", value: config.cors.allowed_origins }
  ];
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="mt-2 break-words font-mono text-sm text-slate-200">{value}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-20 animate-pulse rounded-lg bg-slate-800" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="grid min-h-[320px] place-items-center px-6 text-center">
      <div>
        <p className="text-sm font-medium text-slate-300">Konfigurasi kosong</p>
        <p className="mt-1 text-xs text-slate-500">Data konfigurasi belum tersedia dari backend.</p>
      </div>
    </div>
  );
}
