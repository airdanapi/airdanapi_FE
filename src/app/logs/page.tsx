import { AppShell } from "@/components/app-shell";

export default function LogsPage() {
  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase text-primary">Monitoring</p>
          <h2 className="mt-1 text-2xl font-semibold">Request Logs</h2>
        </div>
        <span className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-text-secondary">
          Sprint 7
        </span>
      </div>
      <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-surface py-20 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 text-text-secondary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <p className="text-sm font-medium text-text-secondary">Request Logs</p>
        <p className="mt-1 text-xs text-slate-600">Filter, tabel dense, dan detail drawer akan tersedia di Sprint 7.</p>
      </div>
    </AppShell>
  );
}
