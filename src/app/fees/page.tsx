import { AppShell } from "@/components/app-shell";

export default function FeesPage() {
  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase text-monetary">Finance</p>
          <h2 className="mt-1 text-2xl font-semibold">Gateway Fees</h2>
        </div>
        <span className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-text-secondary">
          Sprint 7
        </span>
      </div>
      <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-surface py-20 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 text-text-secondary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <p className="text-sm font-medium text-text-secondary">Gateway Fees</p>
        <p className="mt-1 text-xs text-slate-600">Revenue summary, pending fees, retry button, dan trend chart akan tersedia di Sprint 7.</p>
      </div>
    </AppShell>
  );
}
