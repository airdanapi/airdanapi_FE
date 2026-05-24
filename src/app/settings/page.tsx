import { AppShell } from "@/components/app-shell";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase text-text-secondary">Akun</p>
          <h2 className="mt-1 text-2xl font-semibold">Settings</h2>
        </div>
        <span className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-text-secondary">
          Sprint 7
        </span>
      </div>
      <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-surface py-20 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 text-text-secondary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" />
          </svg>
        </div>
        <p className="text-sm font-medium text-text-secondary">Settings</p>
        <p className="mt-1 text-xs text-slate-600">Profile, security, dan active sessions akan tersedia di Sprint 7.</p>
      </div>
    </AppShell>
  );
}
