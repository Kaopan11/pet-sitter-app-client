const API_URL = process.env.NEXT_PUBLIC_API_URL;

function assertApiUrl() {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. Add it to .env.local or Vercel env.",
    );
  }
}

async function apiFetch(path) {
  assertApiUrl();

  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
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
