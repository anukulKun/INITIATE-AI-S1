const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

function token() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("initiate_ai_s1_token") || "";
}

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token() ? `Bearer ${token()}` : "",
      ...(options.headers || {}),
    },
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const details = payload?.details ? ` | ${String(payload.details).slice(0, 400)}` : "";
    throw new Error((payload.error || "Request failed") + details);
  }
  return payload;
}

export const api = {
  register: (email: string, password: string, walletAddress?: string) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, walletAddress }),
    }),
  login: (email: string, password: string) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  compileWorkflow: (name: string, graph: unknown) =>
    request("/api/workflow/compile", {
      method: "POST",
      body: JSON.stringify({ name, graph }),
    }),
  chat: (workflowId: string, message: string) =>
    request("/api/agent/chat", {
      method: "POST",
      body: JSON.stringify({ workflowId, message }),
    }),
  resolve: (username: string) => request(`/api/resolve/${encodeURIComponent(username)}`),
  transfer: (payload: Record<string, unknown>) =>
    request("/api/defi/transfer", { method: "POST", body: JSON.stringify(payload) }),
  createGroup: (payload: Record<string, unknown>) =>
    request("/api/defi/group/create", { method: "POST", body: JSON.stringify(payload) }),
  contributeGroup: (payload: Record<string, unknown>) =>
    request("/api/defi/group/contribute", { method: "POST", body: JSON.stringify(payload) }),
  createPot: (payload: Record<string, unknown>) =>
    request("/api/defi/pot/create", { method: "POST", body: JSON.stringify(payload) }),
  depositPot: (payload: Record<string, unknown>) =>
    request("/api/defi/pot/deposit", { method: "POST", body: JSON.stringify(payload) }),
  getTransfers: (address: string) => request(`/api/defi/transfers/${address}`),
  getPots: (address: string) => request(`/api/defi/pots/${address}`),
};

export function persistSession(tokenValue: string, user: unknown) {
  localStorage.setItem("initiate_ai_s1_token", tokenValue);
  localStorage.setItem("initiate_ai_s1_user", JSON.stringify(user));
}

export function readSessionUser() {
  const value = localStorage.getItem("initiate_ai_s1_user");
  return value ? JSON.parse(value) : null;
}

