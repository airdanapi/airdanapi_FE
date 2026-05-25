"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  getFeesPending,
  getFeesSummary,
  retryFee,
  type FeeSummary,
  type GatewayFee
} from "@/lib/api";

const statuses = ["PENDING", "FAILED", "SUCCESS"] as const;
const perPage = 20;

type FeeStatus = (typeof statuses)[number];
type LoadState = "loading" | "ready" | "error";

const fallbackSummary: FeeSummary = {
  revenue_total: 0,
  pending_count: 0,
  failed_count: 0
};

export default function FeesPage() {
  const [summary, setSummary] = useState<FeeSummary>(fallbackSummary);
  const [items, setItems] = useState<GatewayFee[]>([]);
  const [status, setStatus] = useState<FeeStatus>("PENDING");
  const [page, setPage] = useState(1);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [retryingId, setRetryingId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");

  const loadFees = useCallback(async () => {
    setRefreshing(true);
    try {
      const [nextSummary, nextFees] = await Promise.all([
        getFeesSummary(),
        getFeesPending(page, perPage, status)
      ]);
      setSummary(nextSummary);
      setItems(nextFees.items);
      setState("ready");
      setError("");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Gateway fees gagal dimuat");
    } finally {
      setRefreshing(false);
    }
  }, [page, status]);

  useEffect(() => {
    loadFees();
  }, [loadFees]);

  async function handleRetry(fee: GatewayFee) {
    setRetryingId(fee.id);
    setNotice("");
    try {
      const updated = await retryFee(fee.id);
      setNotice(`Retry ${updated.request_id} selesai dengan status ${updated.status}.`);
      await loadFees();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Retry fee gagal");
      setState("error");
    } finally {
      setRetryingId(null);
    }
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase text-monetary">Finance</p>
          <h2 className="mt-1 text-2xl font-semibold">Gateway Fees</h2>
        </div>
        <button
          type="button"
          onClick={loadFees}
          disabled={refreshing}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-monetary/50 hover:text-monetary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {refreshing ? "Memuat..." : "Refresh"}
        </button>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <SummaryCard label="Revenue Total" value={currency(summary.revenue_total)} tone="monetary" loading={state === "loading"} />
        <SummaryCard label="Pending Fees" value={summary.pending_count.toLocaleString("id-ID")} tone="warning" loading={state === "loading"} />
        <SummaryCard label="Failed Fees" value={summary.failed_count.toLocaleString("id-ID")} tone="danger" loading={state === "loading"} />
      </section>

      <section className="mt-5 rounded-lg border border-slate-800 bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-md border border-slate-800 bg-slate-950 p-1">
            {statuses.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setStatus(item);
                  setPage(1);
                  setNotice("");
                }}
                className={`rounded px-3 py-1.5 text-xs font-medium ${status === item ? "bg-monetary text-white" : "text-slate-500 hover:text-slate-200"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-100 disabled:opacity-40">
              Prev
            </button>
            <span className="font-mono text-xs text-slate-500">Page {page}</span>
            <button type="button" onClick={() => setPage((value) => value + 1)} disabled={items.length < perPage} className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-100 disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      </section>

      {notice && <div className="mt-5 rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-green-200">{notice}</div>}
      {state === "error" && <div className="mt-5 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-red-200">{error}</div>}

      <section className="mt-5 overflow-hidden rounded-lg border border-slate-800 bg-surface">
        <div className="border-b border-slate-800 px-4 py-3">
          <h3 className="text-sm font-semibold">{status} Fees</h3>
        </div>
        {state === "loading" ? (
          <TableSkeleton />
        ) : items.length === 0 ? (
          <EmptyState title="Belum ada fee" description={`Tidak ada fee dengan status ${status}.`} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1060px] text-left text-xs">
              <thead className="bg-slate-950 text-slate-500">
                <tr>
                  <Th>Created</Th>
                  <Th>Request ID</Th>
                  <Th>Source</Th>
                  <Th>User</Th>
                  <Th>Transaction</Th>
                  <Th>Fee</Th>
                  <Th>Status</Th>
                  <Th>Retry</Th>
                  <Th>Next Retry</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {items.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-900/70">
                    <Td>{formatDate(fee.created_at)}</Td>
                    <Td mono>{fee.request_id}</Td>
                    <Td>{fee.source_app}</Td>
                    <Td>{fee.user_id}</Td>
                    <Td>{currency(fee.transaction_amount)}</Td>
                    <Td>{currency(fee.fee_amount)}</Td>
                    <Td><FeeBadge status={fee.status} /></Td>
                    <Td>{fee.retry_count}/{fee.max_retries}</Td>
                    <Td>{fee.next_retry_at ? formatDate(fee.next_retry_at) : "-"}</Td>
                    <Td>
                      <button
                        type="button"
                        onClick={() => handleRetry(fee)}
                        disabled={!["PENDING", "FAILED"].includes(fee.status) || retryingId === fee.id}
                        className="rounded-md border border-slate-700 px-2.5 py-1 text-xs text-slate-300 hover:border-monetary/50 hover:text-monetary disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {retryingId === fee.id ? "Retry..." : "Retry"}
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}

function SummaryCard({ label, value, tone, loading }: { label: string; value: string; tone: "monetary" | "warning" | "danger"; loading: boolean }) {
  const color = tone === "monetary" ? "text-monetary" : tone === "warning" ? "text-yellow-300" : "text-red-300";
  return (
    <article className="rounded-lg border border-slate-800 bg-surface p-5">
      <p className="text-xs uppercase text-text-secondary">{label}</p>
      {loading ? <div className="mt-4 h-8 w-32 animate-pulse rounded bg-slate-800" /> : <p className={`mt-3 text-3xl font-semibold tabular-nums ${color}`}>{value}</p>}
    </article>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}

function Td({ children, mono = false }: { children: React.ReactNode; mono?: boolean }) {
  return <td className={`px-4 py-3 align-middle text-slate-300 ${mono ? "font-mono" : ""}`}>{children}</td>;
}

function FeeBadge({ status }: { status: string }) {
  const cls = status === "SUCCESS" ? "border-success/30 bg-success/10 text-green-300" : status === "FAILED" ? "border-danger/30 bg-danger/10 text-red-300" : "border-warning/30 bg-warning/10 text-yellow-300";
  return <span className={`rounded border px-2 py-0.5 font-mono text-[11px] ${cls}`}>{status}</span>;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid min-h-[320px] place-items-center px-6 text-center">
      <div>
        <p className="text-sm font-medium text-slate-300">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
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

function currency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
