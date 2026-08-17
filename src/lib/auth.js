// เก็บ token/user ในเบราว์เซอร์หลัง login/register (รวม user.isSitter)
// persist true = localStorage (Remember) | false = sessionStorage (ปิดแท็บแล้วหาย)

const TOKEN_KEY = "pet-sitter-token";
const USER_KEY = "pet-sitter-user";

export function saveAuth({ token, user }, persist = true) {
  const storage = persist ? localStorage : sessionStorage;
  const other = persist ? sessionStorage : localStorage;

  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
  other.removeItem(TOKEN_KEY);
  other.removeItem(USER_KEY);
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const raw =
    localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}
