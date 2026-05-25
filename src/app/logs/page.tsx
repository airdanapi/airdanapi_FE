"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { getLogs, type LogFilter, type RequestLog } from "@/lib/api";

const perPage = 20;
const detailTabs = ["Overview", "Body Hash", "Trace", "Related"] as const;

type DetailTab = (typeof detailTabs)[number];
type LoadState = "loading" | "ready" | "error";

type FilterState = {
  user_id: string;
  request_id: string;
  target_app: string;
  status_code: string;
  from: string;
  to: string;
};

const emptyFilters: FilterState = {
  user_id: "",
  request_id: "",
  target_app: "",
  status_code: "",
  from: "",
  to: ""
};

export default function LogsPage() {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [page, setPage] = useState(1);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<RequestLog | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("Overview");
  const [refreshing, setRefreshing] = useState(false);

  const query = useMemo<LogFilter>(() => {
    const next: LogFilter = { page, per_page: perPage };
    if (filters.user_id.trim()) next.user_id = filters.user_id.trim();
    if (filters.request_id.trim()) next.request_id = filters.request_id.trim();
    if (filters.target_app.trim()) next.target_app = filters.target_app.trim();
    if (filters.status_code.trim()) {
      const parsed = Number(filters.status_code);
      if (Number.isFinite(parsed)) next.status_code = parsed;
    }
    if (filters.from) next.from = new Date(filters.from).toISOString();
    if (filters.to) next.to = new Date(filters.to).toISOString();
    return next;
  }, [filters, page]);

  const loadLogs = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await getLogs(query);
      setLogs(response.items);
      setState("ready");
      setError("");
      setSelected((current) => {
        if (!current) return null;
        return response.items.find((item) => item.id === current.id) ?? null;
      });
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Request logs gagal dimuat");
    } finally {
      setRefreshing(false);
    }
  }, [query]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  function updateFilter(key: keyof FilterState, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  function resetFilters() {
    setFilters(emptyFilters);
    setPage(1);
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase text-primary">Monitoring</p>
          <h2 className="mt-1 text-2xl font-semibold">Request Logs</h2>
        </div>
        <button
          type="button"
          onClick={loadLogs}
          disabled={refreshing}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {refreshing ? "Memuat..." : "Refresh"}
        </button>
      </div>

      <section className="mt-6 rounded-lg border border-slate-800 bg-surface p-4">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <FilterInput label="User" value={filters.user_id} onChange={(value) => updateFilter("user_id", value)} />
          <FilterInput label="Request ID" value={filters.request_id} onChange={(value) => updateFilter("request_id", value)} />
          <FilterInput label="Target" value={filters.target_app} onChange={(value) => updateFilter("target_app", value)} />
          <FilterInput label="Status" value={filters.status_code} inputMode="numeric" onChange={(value) => updateFilter("status_code", value)} />
          <FilterInput label="From" value={filters.from} type="datetime-local" onChange={(value) => updateFilter("from", value)} />
          <FilterInput label="To" value={filters.to} type="datetime-local" onChange={(value) => updateFilter("to", value)} />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
          <p className="font-mono text-xs text-slate-500">Page {page} / {perPage} rows</p>
          <div className="flex gap-2">
            <button type="button" onClick={resetFilters} className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-100">
              Reset
            </button>
            <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-100 disabled:opacity-40">
              Prev
            </button>
            <button type="button" onClick={() => setPage((value) => value + 1)} disabled={logs.length < perPage} className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-100 disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      </section>

      {state === "error" && <ErrorBanner message={error} />}

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-lg border border-slate-800 bg-surface">
          <div className="border-b border-slate-800 px-4 py-3">
            <h3 className="text-sm font-semibold">Log Entries</h3>
          </div>
          {state === "loading" ? (
            <TableSkeleton />
          ) : logs.length === 0 ? (
            <EmptyState title="Belum ada log" description="Request yang sudah diproses Gateway akan muncul di sini." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-xs">
                <thead className="bg-slate-950 text-slate-500">
                  <tr>
                    <Th>Waktu</Th>
                    <Th>Request</Th>
                    <Th>User</Th>
                    <Th>Target</Th>
                    <Th>Method</Th>
                    <Th>Endpoint</Th>
                    <Th>Status</Th>
                    <Th>Latency</Th>
                    <Th>Lifecycle</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => {
                        setSelected(log);
                        setActiveTab("Overview");
                      }}
                      className={`cursor-pointer hover:bg-slate-900/70 ${selected?.id === log.id ? "bg-primary/10" : ""}`}
                    >
                      <Td>{formatDate(log.created_at)}</Td>
                      <Td mono>{log.request_id}</Td>
                      <Td>{log.user_id ?? "-"}</Td>
                      <Td>{log.target_app}</Td>
                      <Td><MethodBadge method={log.method} /></Td>
                      <Td className="max-w-[260px] truncate">{log.endpoint}</Td>
                      <Td><StatusBadge code={log.status_code} /></Td>
                      <Td>{log.latency_ms == null ? "-" : `${log.latency_ms} ms`}</Td>
                      <Td><LifecycleBadge value={log.lifecycle} /></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="rounded-lg border border-slate-800 bg-surface">
          <div className="border-b border-slate-800 px-4 py-3">
            <h3 className="text-sm font-semibold">Detail</h3>
          </div>
          {!selected ? (
            <EmptyState title="Pilih satu log" description="Detail request, hash body, dan trace akan muncul di panel ini." compact />
          ) : (
            <div>
              <div className="flex border-b border-slate-800 px-2 pt-2">
                {detailTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-t-md px-3 py-2 text-xs ${activeTab === tab ? "bg-slate-900 text-primary" : "text-slate-500 hover:text-slate-200"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <LogDetail log={selected} tab={activeTab} />
            </div>
          )}
        </aside>
      </section>
    </AppShell>
  );
}

function LogDetail({ log, tab }: { log: RequestLog; tab: DetailTab }) {
  if (tab === "Body Hash") {
    return (
      <div className="space-y-3 p-4">
        <DetailRow label="Request Hash" value={log.request_hash ?? "-"} mono />
        <DetailRow label="Response Hash" value={log.response_hash ?? "-"} mono />
      </div>
    );
  }
  if (tab === "Trace") {
    return (
      <div className="space-y-3 p-4">
        <DetailRow label="Request ID" value={log.request_id} mono />
        <DetailRow label="Parent ID" value={log.parent_request_id ?? "-"} mono />
        <DetailRow label="IP Address" value={log.ip_address} mono />
      </div>
    );
  }
  if (tab === "Related") {
    return (
      <div className="space-y-3 p-4">
        <DetailRow label="Source App" value={log.source_app ?? "-"} />
        <DetailRow label="Target App" value={log.target_app} />
        <DetailRow label="Error" value={log.error_message ?? "-"} />
      </div>
    );
  }
  return (
    <div className="space-y-3 p-4">
      <DetailRow label="Endpoint" value={log.endpoint} />
      <DetailRow label="Method" value={log.method} />
      <DetailRow label="Status" value={log.status_code == null ? "-" : String(log.status_code)} />
      <DetailRow label="Latency" value={log.latency_ms == null ? "-" : `${log.latency_ms} ms`} />
      <DetailRow label="Lifecycle" value={log.lifecycle} />
      <DetailRow label="Created" value={formatDate(log.created_at)} />
    </div>
  );
}

function FilterInput({ label, value, onChange, type = "text", inputMode }: { label: string; value: string; onChange: (value: string) => void; type?: string; inputMode?: "numeric" }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-text-primary outline-none focus:border-primary"
      />
    </label>
  );
}

function DetailRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 break-words text-sm text-slate-200 ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}

function Td({ children, mono = false, className = "" }: { children: React.ReactNode; mono?: boolean; className?: string }) {
  return <td className={`px-4 py-3 align-middle text-slate-300 ${mono ? "font-mono" : ""} ${className}`}>{children}</td>;
}

function MethodBadge({ method }: { method: string }) {
  return <span className="rounded border border-info/30 bg-info/10 px-2 py-0.5 font-mono text-[11px] text-blue-300">{method}</span>;
}

function StatusBadge({ code }: { code: number | null }) {
  const cls = code == null ? "border-slate-700 text-slate-500" : code >= 400 ? "border-danger/30 bg-danger/10 text-red-300" : "border-success/30 bg-success/10 text-green-300";
  return <span className={`rounded border px-2 py-0.5 font-mono text-[11px] ${cls}`}>{code ?? "-"}</span>;
}

function LifecycleBadge({ value }: { value: string }) {
  const cls = value === "FAILED" ? "text-red-300" : value === "COMPLETED" ? "text-green-300" : "text-yellow-300";
  return <span className={`font-mono text-[11px] ${cls}`}>{value}</span>;
}

function ErrorBanner({ message }: { message: string }) {
  return <div className="mt-5 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-red-200">{message}</div>;
}

function EmptyState({ title, description, compact = false }: { title: string; description: string; compact?: boolean }) {
  return (
    <div className={`grid place-items-center px-6 text-center ${compact ? "min-h-[260px]" : "min-h-[360px]"}`}>
      <div>
        <p className="text-sm font-medium text-slate-300">{title}</p>
        <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="h-9 animate-pulse rounded bg-slate-800" />
      ))}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
