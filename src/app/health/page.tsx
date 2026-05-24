import { AppShell } from "@/components/app-shell";

export default function HealthPage() {
  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase text-success">Status</p>
          <h2 className="mt-1 text-2xl font-semibold">Service Health</h2>
        </div>
        <span className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-text-secondary">
          Sprint 7
        </span>
      </div>
      <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-surface py-20 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 text-text-secondary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <p className="text-sm font-medium text-text-secondary">Service Health</p>
        <p className="mt-1 text-xs text-slate-600">Status cards, circuit state, latency, dan force probe akan tersedia di Sprint 7.</p>
      </div>
    </AppShell>
  );
}
