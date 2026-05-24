import { AppShell } from "@/components/app-shell";

export default function RoutesPage() {
  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase text-primary">Registry</p>
          <h2 className="mt-1 text-2xl font-semibold">Route Registry</h2>
        </div>
        <span className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-text-secondary">
          Sprint 7
        </span>
      </div>
      <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-surface py-20 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 text-text-secondary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <p className="text-sm font-medium text-text-secondary">Route Registry</p>
        <p className="mt-1 text-xs text-slate-600">Tab per service, route table, add/edit drawer, dan active toggle akan tersedia di Sprint 7.</p>
      </div>
    </AppShell>
  );
}
