"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  createRoute,
  getRoutes,
  toggleRoute,
  updateRoute,
  type Route,
  type RouteInput
} from "@/lib/api";

const services = [
  { key: "all", label: "All" },
  { key: "smartbank", label: "SmartBank" },
  { key: "marketplace", label: "Marketplace" },
  { key: "pos", label: "POS" },
  { key: "supplierhub", label: "SupplierHub" },
  { key: "logistikita", label: "LogistiKita" },
  { key: "umkm_insight", label: "UMKM Insight" }
];

const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const routeClasses = ["read", "transactional"];

type LoadState = "loading" | "ready" | "error";
type FormMode = "create" | "edit";

type RouteForm = {
  service_name: string;
  feature_name: string;
  method: string;
  downstream_url: string;
  transactional: boolean;
  route_class: string;
  timeout_ms: string;
  retry_count: string;
  required_scope: string;
  description: string;
  is_active: boolean;
};

const emptyForm: RouteForm = {
  service_name: "marketplace",
  feature_name: "",
  method: "POST",
  downstream_url: "",
  transactional: false,
  route_class: "read",
  timeout_ms: "5000",
  retry_count: "0",
  required_scope: "",
  description: "",
  is_active: true
};

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [activeService, setActiveService] = useState("all");
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [mode, setMode] = useState<FormMode>("create");
  const [editing, setEditing] = useState<Route | null>(null);
  const [form, setForm] = useState<RouteForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");

  const filteredRoutes = useMemo(() => {
    if (activeService === "all") return routes;
    return routes.filter((route) => route.service_name === activeService);
  }, [activeService, routes]);

  const loadRoutes = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await getRoutes();
      setRoutes(response.items);
      setState("ready");
      setError("");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Route registry gagal dimuat");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  function openCreate() {
    setMode("create");
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setPanelOpen(true);
  }

  function openEdit(route: Route) {
    setMode("edit");
    setEditing(route);
    setForm({
      service_name: route.service_name,
      feature_name: route.feature_name,
      method: route.method,
      downstream_url: route.downstream_url,
      transactional: route.transactional,
      route_class: route.route_class,
      timeout_ms: String(route.timeout_ms),
      retry_count: String(route.retry_count),
      required_scope: route.required_scope ?? "",
      description: route.description ?? "",
      is_active: route.is_active
    });
    setFormError("");
    setPanelOpen(true);
  }

  function updateForm<K extends keyof RouteForm>(key: K, value: RouteForm[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "transactional") {
        next.route_class = value ? "transactional" : "read";
      }
      if (key === "route_class") {
        next.transactional = value === "transactional";
      }
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const input = routeInputFromForm(form);
    if (!input) {
      setFormError("Service, feature, method, downstream URL, timeout, dan retry harus valid.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "edit" && editing) {
        await updateRoute(editing.id, input);
        setNotice(`Route ${input.service_name}/${input.feature_name} diperbarui.`);
      } else {
        await createRoute(input);
        setNotice(`Route ${input.service_name}/${input.feature_name} dibuat.`);
      }
      setPanelOpen(false);
      await loadRoutes();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Route gagal disimpan");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(route: Route) {
    setTogglingId(route.id);
    setNotice("");
    try {
      await toggleRoute(route.id, !route.is_active);
      await loadRoutes();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Route gagal ditoggle");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase text-primary">Registry</p>
          <h2 className="mt-1 text-2xl font-semibold">Route Registry</h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadRoutes}
            disabled={refreshing}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing ? "Memuat..." : "Refresh"}
          </button>
          <button type="button" onClick={openCreate} className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90">
            Add Route
          </button>
        </div>
      </div>

      <section className="mt-6 flex flex-wrap gap-2">
        {services.map((service) => (
          <button
            key={service.key}
            type="button"
            onClick={() => setActiveService(service.key)}
            className={`rounded-md border px-3 py-1.5 text-xs ${activeService === service.key ? "border-primary bg-primary/15 text-primary" : "border-slate-700 text-slate-500 hover:text-slate-200"}`}
          >
            {service.label}
          </button>
        ))}
      </section>

      {notice && <div className="mt-5 rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-green-200">{notice}</div>}
      {state === "error" && <div className="mt-5 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-red-200">{error}</div>}

      <section className="mt-5 overflow-hidden rounded-lg border border-slate-800 bg-surface">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <h3 className="text-sm font-semibold">Routes</h3>
          <span className="font-mono text-xs text-slate-500">{filteredRoutes.length} item</span>
        </div>
        {state === "loading" ? (
          <TableSkeleton />
        ) : filteredRoutes.length === 0 ? (
          <EmptyState title="Belum ada route" description="Tambahkan route baru atau pilih service lain." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-xs">
              <thead className="bg-slate-950 text-slate-500">
                <tr>
                  <Th>Method</Th>
                  <Th>Service</Th>
                  <Th>Feature</Th>
                  <Th>Downstream URL</Th>
                  <Th>Class</Th>
                  <Th>Tx</Th>
                  <Th>Scope</Th>
                  <Th>Timeout</Th>
                  <Th>Retry</Th>
                  <Th>Active</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRoutes.map((route) => (
                  <tr key={route.id} className="hover:bg-slate-900/70">
                    <Td><MethodBadge method={route.method} /></Td>
                    <Td>{route.service_name}</Td>
                    <Td>{route.feature_name}</Td>
                    <Td className="max-w-[340px] truncate font-mono text-[11px]">{route.downstream_url}</Td>
                    <Td><ClassBadge value={route.route_class} /></Td>
                    <Td>{route.transactional ? "Yes" : "No"}</Td>
                    <Td>{route.required_scope ?? "-"}</Td>
                    <Td>{route.timeout_ms} ms</Td>
                    <Td>{route.retry_count}</Td>
                    <Td>
                      <button
                        type="button"
                        onClick={() => handleToggle(route)}
                        disabled={togglingId === route.id}
                        className={`h-6 w-11 rounded-full border p-0.5 transition-colors ${route.is_active ? "border-success/40 bg-success/20" : "border-slate-700 bg-slate-900"} disabled:opacity-40`}
                        aria-label="Toggle route active state"
                      >
                        <span className={`block h-4 w-4 rounded-full transition-transform ${route.is_active ? "translate-x-5 bg-green-300" : "bg-slate-500"}`} />
                      </button>
                    </Td>
                    <Td>
                      <button type="button" onClick={() => openEdit(route)} className="rounded-md border border-slate-700 px-2.5 py-1 text-xs text-slate-300 hover:border-primary/50 hover:text-primary">
                        Edit
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {panelOpen && (
        <div className="fixed inset-0 z-30 bg-black/50">
          <div className="absolute right-0 top-0 h-full w-[440px] border-l border-slate-800 bg-background shadow-2xl">
            <form onSubmit={handleSubmit} className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                <div>
                  <p className="font-mono text-xs uppercase text-primary">{mode === "edit" ? "Edit" : "Create"}</p>
                  <h3 className="font-semibold">Route</h3>
                </div>
                <button type="button" onClick={() => setPanelOpen(false)} className="rounded-md border border-slate-700 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-100">
                  Close
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                {formError && <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-red-200">{formError}</div>}
                <TextField label="Service" value={form.service_name} onChange={(value) => updateForm("service_name", value.toLowerCase())} />
                <TextField label="Feature" value={form.feature_name} onChange={(value) => updateForm("feature_name", value.toLowerCase())} />
                <SelectField label="Method" value={form.method} options={methods} onChange={(value) => updateForm("method", value)} />
                <TextField label="Downstream URL" value={form.downstream_url} onChange={(value) => updateForm("downstream_url", value)} />
                <SelectField label="Route Class" value={form.route_class} options={routeClasses} onChange={(value) => updateForm("route_class", value)} />
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Timeout ms" value={form.timeout_ms} inputMode="numeric" onChange={(value) => updateForm("timeout_ms", value)} />
                  <TextField label="Retry Count" value={form.retry_count} inputMode="numeric" onChange={(value) => updateForm("retry_count", value)} />
                </div>
                <TextField label="Required Scope" value={form.required_scope} onChange={(value) => updateForm("required_scope", value)} />
                <TextArea label="Description" value={form.description} onChange={(value) => updateForm("description", value)} />
                <label className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm">
                  <span>Transactional</span>
                  <input type="checkbox" checked={form.transactional} onChange={(event) => updateForm("transactional", event.target.checked)} />
                </label>
                <label className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm">
                  <span>Active</span>
                  <input type="checkbox" checked={form.is_active} onChange={(event) => updateForm("is_active", event.target.checked)} />
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 px-5 py-4">
                <button type="button" onClick={() => setPanelOpen(false)} className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:text-slate-100">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 disabled:opacity-50">
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function routeInputFromForm(form: RouteForm): RouteInput | null {
  const timeout = Number(form.timeout_ms);
  const retry = Number(form.retry_count);
  if (
    !form.service_name.trim() ||
    !form.feature_name.trim() ||
    !form.method.trim() ||
    !form.downstream_url.trim() ||
    !Number.isFinite(timeout) ||
    timeout <= 0 ||
    !Number.isFinite(retry) ||
    retry < 0 ||
    !routeClasses.includes(form.route_class)
  ) {
    return null;
  }
  return {
    service_name: form.service_name.trim().toLowerCase(),
    feature_name: form.feature_name.trim().toLowerCase(),
    method: form.method.trim().toUpperCase(),
    downstream_url: form.downstream_url.trim(),
    transactional: form.transactional,
    route_class: form.route_class,
    timeout_ms: timeout,
    retry_count: retry,
    required_scope: form.required_scope.trim() || undefined,
    description: form.description.trim() || undefined,
    is_active: form.is_active
  };
}

function TextField({ label, value, onChange, inputMode }: { label: string; value: string; onChange: (value: string) => void; inputMode?: "numeric" }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-500">{label}</span>
      <input value={value} inputMode={inputMode} onChange={(event) => onChange(event.target.value)} className="h-9 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-text-primary outline-none focus:border-primary" />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-500">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className="w-full resize-none rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-text-primary outline-none focus:border-primary" />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-text-primary outline-none focus:border-primary">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle text-slate-300 ${className}`}>{children}</td>;
}

function MethodBadge({ method }: { method: string }) {
  return <span className="rounded border border-info/30 bg-info/10 px-2 py-0.5 font-mono text-[11px] text-blue-300">{method}</span>;
}

function ClassBadge({ value }: { value: string }) {
  const cls = value === "transactional" ? "border-monetary/30 bg-monetary/10 text-purple-300" : "border-success/30 bg-success/10 text-green-300";
  return <span className={`rounded border px-2 py-0.5 font-mono text-[11px] ${cls}`}>{value}</span>;
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
