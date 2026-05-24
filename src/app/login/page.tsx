"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { saveSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@airdanapi.local");
  const [password, setPassword] = useState("admin12345");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? "development";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const session = await login(email, password);
      saveSession(session.token, session.operator);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 text-text-primary">
      <section className="w-full max-w-md rounded-lg border border-slate-800 bg-surface p-7 shadow-2xl shadow-black/30">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase text-primary">
              Integrator Console
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Operator Login</h1>
          </div>
          <span className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 font-mono text-xs uppercase text-primary">
            {appEnv}
          </span>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm text-text-secondary">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none ring-primary/30 focus:border-primary focus:ring-4"
              type="email"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="text-sm text-text-secondary">Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none ring-primary/30 focus:border-primary focus:ring-4"
              type="password"
              autoComplete="current-password"
            />
          </label>

          {error ? (
            <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Memproses" : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
