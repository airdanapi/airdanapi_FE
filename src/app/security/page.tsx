import { AppShell } from "@/components/app-shell";

export default function SecurityPage() {
  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase text-info">Auth</p>
          <h2 className="mt-1 text-2xl font-semibold">Security &amp; JWT</h2>
        </div>
        <span className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-text-secondary">
          Sprint 7
        </span>
      </div>
      <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-surface py-20 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 text-text-secondary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-text-secondary">Security &amp; JWT</p>
        <p className="mt-1 text-xs text-slate-600">Signing keys, token blacklist, scopes dan roles akan tersedia di Sprint 7.</p>
      </div>
    </AppShell>
  );
}
