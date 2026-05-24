import { getToken, type Operator } from "./auth";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ─── Core envelope ──────────────────────────────────────────────────────────

type Envelope<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    status: number;
  };
};

// ─── Auth ────────────────────────────────────────────────────────────────────

export type LoginResponse = {
  token: string;
  expires_at: string;
  operator: Operator;
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

export type DashboardSummary = {
  total_requests: number;
  error_rate: number;
  average_latency_ms: number;
  fee_revenue: number;
  pending_fees: number;
  failed_fees: number;
};

export type ThroughputPoint = {
  bucket: string;
  count: number;
};

// ─── Routes ──────────────────────────────────────────────────────────────────

export type Route = {
  id: number;
  service_name: string;
  feature_name: string;
  method: string;
  downstream_url: string;
  transactional: boolean;
  route_class: string;
  timeout_ms: number;
  retry_count: number;
  required_scope: string | null;
  is_active: boolean;
  description: string | null;
};

export type RouteInput = {
  service_name: string;
  feature_name: string;
  method: string;
  downstream_url: string;
  transactional: boolean;
  route_class: string;
  timeout_ms: number;
  retry_count: number;
  required_scope?: string;
  is_active?: boolean;
  description?: string;
};

// ─── Service Health ───────────────────────────────────────────────────────────

export type ServiceHealth = {
  service_name: string;
  status: string;
  circuit_state: string;
  routes: number;
};

// ─── Gateway Fees ─────────────────────────────────────────────────────────────

export type FeeSummary = {
  revenue_total: number;
  pending_count: number;
  failed_count: number;
};

export type GatewayFee = {
  id: number;
  request_id: string;
  user_id: string;
  target_app: string;
  original_amount: number;
  fee_amount: number;
  status: string;
  retry_count: number;
  next_retry_at: string | null;
  created_at: string;
};

// ─── Request Logs ─────────────────────────────────────────────────────────────

export type RequestLog = {
  id: number;
  request_id: string;
  parent_request_id: string | null;
  user_id: string;
  source_app: string;
  target_app: string;
  endpoint: string;
  method: string;
  status_code: number;
  latency_ms: number;
  ip_address: string;
  request_hash: string;
  response_hash: string | null;
  lifecycle: string;
  error_message: string | null;
  created_at: string;
};

export type LogFilter = {
  user_id?: string;
  request_id?: string;
  from?: string;
  to?: string;
  status_code?: number;
  target_app?: string;
  page?: number;
  per_page?: number;
};

// ─── Auth functions ───────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  return request<LoginResponse>("/console/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    skipAuth: true
  });
}

export async function logout() {
  return request<{ logged_out: boolean }>("/console/auth/logout", {
    method: "POST"
  });
}

export async function getMe() {
  return request<Operator>("/console/auth/me");
}

// ─── Dashboard functions ──────────────────────────────────────────────────────

export async function getDashboardSummary() {
  return request<DashboardSummary>("/console/dashboard/summary");
}

export async function getDashboardThroughput() {
  return request<{ items: ThroughputPoint[] }>("/console/dashboard/throughput");
}

// ─── Route functions ──────────────────────────────────────────────────────────

export async function getRoutes() {
  return request<{ items: Route[] }>("/console/routes");
}

export async function createRoute(input: RouteInput) {
  return request<Route>("/console/routes", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function updateRoute(id: number, input: RouteInput) {
  return request<Route>(`/console/routes/${id}`, {
    method: "PUT",
    body: JSON.stringify(input)
  });
}

export async function toggleRoute(id: number, isActive: boolean) {
  return request<Route>(`/console/routes/${id}/toggle`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: isActive })
  });
}

// ─── Service health functions ─────────────────────────────────────────────────

export async function getServicesHealth() {
  return request<{ items: ServiceHealth[] }>("/console/services/health");
}

// ─── Fee functions ────────────────────────────────────────────────────────────

export async function getFeesSummary() {
  return request<FeeSummary>("/console/fees/summary");
}

export async function getFeesPending(page = 1, perPage = 20, status = "PENDING") {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    status
  });
  return request<{ items: GatewayFee[]; page: number; per_page: number }>(
    `/console/fees/pending?${params}`
  );
}

export async function retryFee(id: number) {
  return request<{ retried: boolean }>(
    `/integrator/biaya_layanan_integrasi/retry/${id}`,
    { method: "POST" }
  );
}

// ─── Log functions ────────────────────────────────────────────────────────────

export async function getLogs(filter: LogFilter = {}) {
  const params = new URLSearchParams();
  if (filter.user_id) params.set("user_id", filter.user_id);
  if (filter.request_id) params.set("request_id", filter.request_id);
  if (filter.from) params.set("from", filter.from);
  if (filter.to) params.set("to", filter.to);
  if (filter.status_code) params.set("status_code", String(filter.status_code));
  if (filter.target_app) params.set("target_app", filter.target_app);
  if (filter.page) params.set("page", String(filter.page));
  if (filter.per_page) params.set("per_page", String(filter.per_page));
  const query = params.toString();
  return request<{ items: RequestLog[]; page: number; per_page: number }>(
    `/integrator/logging${query ? `?${query}` : ""}`
  );
}

// ─── Internal fetch helper ───────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (!options.skipAuth) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers,
    cache: "no-store"
  });

  const envelope = (await response.json()) as Envelope<T>;
  if (!response.ok || !envelope.success || !envelope.data) {
    throw new Error(envelope.error?.message ?? "Request failed");
  }

  return envelope.data;
}

export { apiUrl };
