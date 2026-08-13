const API_URL = process.env.NEXT_PUBLIC_API_URL;

function assertApiUrl() {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. Add it to .env.local or Vercel env.",
    );
  }
}

async function apiFetch(path, { method = "GET", body } = {}) {
  assertApiUrl();

  const res = await fetch(`${API_URL}${path}`, {
    method,
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || `Request failed (${res.status})`);
  }

  return json;
}

export async function checkHealth() {
  return apiFetch("/health");
}

export async function getUsers() {
  const json = await apiFetch("/api/users");
  return json.data ?? [];
}

export async function login({ email, password }) {
  const json = await apiFetch("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
  return json.data;
}

export async function register({ email, name, phone, password, role }) {
  const json = await apiFetch("/api/auth/register", {
    method: "POST",
    body: { email, name, phone, password, role },
  });
  return json.data;
}
