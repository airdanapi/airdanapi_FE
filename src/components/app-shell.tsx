"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { clearSession, getOperator, getToken, type Operator } from "@/lib/auth";
import { apiUrl, logout } from "@/lib/api";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    )
  },
  {
    href: "/logs",
    label: "Request Logs",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    )
  },
  {
    href: "/fees",
    label: "Gateway Fees",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    )
  },
  {
    href: "/routes",
    label: "Route Registry",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    )
  },
  {
    href: "/health",
    label: "Service Health",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    )
  },
  {
    href: "/security",
    label: "Security & JWT",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    )
  },
  {
    href: "/config",
    label: "Konfigurasi",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    )
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" />
      </svg>
    )
  }
];

function EnvBadge({ env }: { env: string }) {
  const styles: Record<string, string> = {
    production: "border-danger/40 bg-danger/10 text-red-300",
    staging: "border-warning/40 bg-warning/10 text-yellow-300",
    development: "border-primary/40 bg-primary/10 text-primary"
  };
  const cls = styles[env] ?? styles.development;
  return (
    <span className={`rounded-md border px-3 py-1.5 font-mono text-xs uppercase ${cls}`}>
      {env}
    </span>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [operator, setOperator] = useState<Operator | null>(null);

  useEffect(() => {
    const token = getToken();
    const storedOperator = getOperator();
    if (!token || !storedOperator) {
      router.replace("/login");
      return;
    }
    setOperator(storedOperator);
  }, [router]);

  const appEnv = useMemo(
    () => process.env.NEXT_PUBLIC_APP_ENV ?? "development",
    []
  );

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Local session cleanup still wins if the API is unavailable.
    }
    clearSession();
    router.replace("/login");
  }

  if (!operator) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-primary" />
          <p className="text-sm text-text-secondary">Memuat...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-slate-800 bg-slate-950">
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
            </svg>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Integrator</p>
            <h1 className="text-sm font-semibold leading-tight">API Console</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-primary/15 text-primary border-l-2 border-primary pl-[10px]"
                    : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100 border-l-2 border-transparent pl-[10px]"
                ].join(" ")}
              >
                <span className={`shrink-0 transition-colors duration-150 ${active ? "text-primary" : "text-slate-500 group-hover:text-slate-300"}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Operator info */}
        <div className="border-t border-slate-800 px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
              {operator.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{operator.name}</p>
              <p className="truncate text-xs text-text-secondary">{operator.role}</p>
            </div>
          </div>
          <button
            id="logout-button"
            type="button"
            onClick={handleLogout}
            className="w-full rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:border-danger/50 hover:text-danger"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-800 bg-background/95 px-6 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-secondary">API Gateway</span>
            <span className="text-slate-700">/</span>
            <span className="font-mono text-xs text-slate-500">{apiUrl}</span>
          </div>
          <EnvBadge env={appEnv} />
        </header>

        <main className="px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
