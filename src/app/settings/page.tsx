"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { apiUrl, getMe } from "@/lib/api";
import { getOperator, type Operator } from "@/lib/auth";

export default function SettingsPage() {
  const [operator, setOperator] = useState<Operator | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");

  useEffect(() => {
    let mounted = true;
    async function loadOperator() {
      try {
        const me = await getMe();
        if (mounted) {
          setOperator(me);
          setStatus("ready");
        }
      } catch {
        if (mounted) {
          setOperator(getOperator());
          setStatus("fallback");
        }
      }
    }
    loadOperator();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase text-text-secondary">Akun</p>
          <h2 className="mt-1 text-2xl font-semibold">Settings</h2>
        </div>
        <span className={`rounded-md border px-3 py-1.5 text-xs ${status === "ready" ? "border-success/30 bg-success/10 text-green-300" : "border-warning/30 bg-warning/10 text-yellow-300"}`}>
          {status === "loading" ? "Memuat..." : status === "ready" ? "Live session" : "Local session"}
        </span>
      </div>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Panel title="Profile">
          {status === "loading" ? (
            <Skeleton />
          ) : operator ? (
            <div className="space-y-4">
              <Avatar operator={operator} />
              <Detail label="Name" value={operator.name} />
              <Detail label="Email" value={operator.email} />
              <Detail label="Role" value={operator.role} />
              <Detail label="Operator ID" value={String(operator.id)} mono />
            </div>
          ) : (
            <EmptyState title="Operator tidak tersedia" description="Session lokal tidak memuat data operator." />
          )}
        </Panel>

        <Panel title="Security">
          <div className="space-y-4">
            <Detail label="Password Hash" value="argon2id" />
            <Detail label="Session Store" value="In-memory console session" />
            <button disabled className="w-full rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-500 disabled:cursor-not-allowed disabled:opacity-60">
              Change password disabled
            </button>
          </div>
        </Panel>
      </section>

      <section className="mt-5">
        <Panel title="Active Session">
          <div className="grid gap-4 md:grid-cols-3">
            <Detail label="API URL" value={apiUrl} mono />
            <Detail label="Client" value="Browser localStorage" />
            <Detail label="Session Control" value="Logout only" />
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-surface">
      <div className="border-b border-slate-800 px-5 py-4">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Avatar({ operator }: { operator: Operator }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-lg font-semibold text-primary">
        {operator.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="font-medium">{operator.name}</p>
        <p className="text-xs text-slate-500">{operator.email}</p>
      </div>
    </div>
  );
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className={`mt-2 break-words text-sm text-slate-200 ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-14 animate-pulse rounded-lg bg-slate-800" />
      ))}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid min-h-[220px] place-items-center text-center">
      <div>
        <p className="text-sm font-medium text-slate-300">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}
