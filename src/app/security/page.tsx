"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { getSecuritySummary, type SecuritySummary } from "@/lib/api";

const tabs = ["Signing Keys", "Token Blacklist", "Scopes & Roles"] as const;
type Tab = (typeof tabs)[number];
type LoadState = "loading" | "ready" | "error";

export default function SecurityPage() {
  const [summary, setSummary] = useState<SecuritySummary | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Signing Keys");
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadSummary = useCallback(async () => {
    setRefreshing(true);
    try {
      setSummary(await getSecuritySummary());
      setState("ready");
      setError("");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Security summary gagal dimuat");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase text-info">Auth</p>
          <h2 className="mt-1 text-2xl font-semibold">Security &amp; JWT</h2>
        </div>
        <button
          type="button"
          onClick={loadSummary}
          disabled={refreshing}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-info/50 hover:text-info disabled:cursor-not-allowed disabled:opacity-50"
        >
          {refreshing ? "Memuat..." : "Refresh"}
        </button>
      </div>

      {state === "error" && <div className="mt-5 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-red-200">{error}</div>}

      <section className="mt-6 rounded-lg border border-slate-800 bg-surface">
        <div className="flex border-b border-slate-800 px-3 pt-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-t-md px-4 py-2 text-xs ${activeTab === tab ? "bg-slate-900 text-info" : "text-slate-500 hover:text-slate-200"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        {state === "loading" ? <Skeleton /> : summary ? <SecurityContent summary={summary} tab={activeTab} /> : <EmptyState />}
      </section>
    </AppShell>
  );
}

function SecurityContent({ summary, tab }: { summary: SecuritySummary; tab: Tab }) {
  if (tab === "Token Blacklist") {
    return (
      <div className="p-5">
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm font-semibold">JWT Blacklist</p>
          <p className="mt-2 text-sm text-text-secondary">{summary.blacklist.description}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Detail label="Mode" value={summary.blacklist.mode} />
            <Detail label="Management" value={summary.blacklist.management} />
          </div>
        </div>
      </div>
    );
  }

  if (tab === "Scopes & Roles") {
    return (
      <div className="grid gap-5 p-5 xl:grid-cols-2">
        <ListPanel title="Operator Roles" items={summary.roles} />
        <ListPanel title="JWT Scopes" items={summary.scopes} />
      </div>
    );
  }

  return (
    <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
      <Detail label="Issuer" value={summary.issuer} />
      <Detail label="Audience" value={summary.audience} />
      <Detail label="Clock Skew" value={`${summary.clock_skew_seconds}s`} />
      <Detail label="Signing Key" value={summary.signing_key_mode} tone={summary.signing_key_mode === "configured" ? "success" : "warning"} />
      <div className="md:col-span-2 xl:col-span-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
        <p className="text-xs uppercase text-slate-500">Key Rotation Owner</p>
        <p className="mt-2 text-sm text-slate-200">{summary.key_rotation_owner}</p>
      </div>
    </div>
  );
}

function Detail({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "success" | "warning" }) {
  const cls = tone === "success" ? "text-green-300" : tone === "warning" ? "text-yellow-300" : "text-slate-200";
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className={`mt-2 break-words font-mono text-sm ${cls}`}>{value}</p>
    </div>
  );
}

function ListPanel({ title, items }: { title: string; items: Array<{ name: string; description: string }> }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950">
      <div className="border-b border-slate-800 px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="divide-y divide-slate-800">
        {items.map((item) => (
          <div key={item.name} className="px-4 py-3">
            <p className="font-mono text-xs text-info">{item.name}</p>
            <p className="mt-1 text-xs text-slate-500">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-lg bg-slate-800" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="grid min-h-[320px] place-items-center px-6 text-center">
      <div>
        <p className="text-sm font-medium text-slate-300">Security summary kosong</p>
        <p className="mt-1 text-xs text-slate-500">Data security belum tersedia dari backend.</p>
      </div>
    </div>
  );
}
