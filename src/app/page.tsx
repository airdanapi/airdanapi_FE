const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? "development";

export default function Home() {
  return (
    <main className="min-h-screen bg-background px-8 py-10 text-text-primary">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex items-center justify-between border-b border-slate-700 pb-5">
          <div>
            <p className="font-mono text-sm uppercase tracking-wide text-primary">
              API Gateway / Integrator
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Integrator Console</h1>
          </div>
          <span className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 font-mono text-sm text-primary">
            {appEnv}
          </span>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-700 bg-surface p-5">
            <p className="text-sm text-text-secondary">Sprint</p>
            <p className="mt-2 text-2xl font-semibold">0</p>
            <p className="mt-3 text-sm text-text-secondary">
              Bootstrap shell untuk Integrator Console.
            </p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-surface p-5">
            <p className="text-sm text-text-secondary">Backend API</p>
            <p className="mt-2 font-mono text-lg">{apiUrl}</p>
            <p className="mt-3 text-sm text-text-secondary">
              Health endpoint tersedia di /health.
            </p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-surface p-5">
            <p className="text-sm text-text-secondary">Scope</p>
            <p className="mt-2 text-2xl font-semibold text-primary">Foundation</p>
            <p className="mt-3 text-sm text-text-secondary">
              Routing, JWT, fee, dan console penuh masuk sprint berikutnya.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
