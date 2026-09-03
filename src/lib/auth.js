// เก็บ token/user ในเบราว์เซอร์หลัง login/register (รวม user.isSitter / isAdmin)
// persist true = localStorage (Remember) | false = sessionStorage (ปิดแท็บแล้วหาย)

const TOKEN_KEY = "pet-sitter-token";
const USER_KEY = "pet-sitter-user";

function notifyAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth-changed"));
  }
}

function isTokenExpired(token) {
  if (!token || typeof token !== "string") return true;

  const parts = token.split(".");
  if (parts.length < 2) return true;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const payload = JSON.parse(atob(padded));
    if (typeof payload.exp !== "number") return false;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

function removeAuthKeys() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function isAdminUser(user) {
  return Boolean(user?.isAdmin || user?.is_admin);
}

function normalizeUser(user) {
  if (!user || typeof user !== "object") return user;
  return {
    ...user,
    isAdmin: isAdminUser(user),
    isSitter: Boolean(user.isSitter || user.is_sitter),
  };
}

export function saveAuth({ token, user }, persist = true) {
  const storage = persist ? localStorage : sessionStorage;
  const other = persist ? sessionStorage : localStorage;

  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(normalizeUser(user)));
  other.removeItem(TOKEN_KEY);
  other.removeItem(USER_KEY);
  notifyAuthChanged();
}

function getAuthStorage() {
  if (typeof window === "undefined") return null;
  if (localStorage.getItem(TOKEN_KEY)) return localStorage;
  if (sessionStorage.getItem(TOKEN_KEY)) return sessionStorage;
  return null;
}

export function getToken() {
  const token = getAuthStorage()?.getItem(TOKEN_KEY) ?? null;
  if (!token) return null;
  if (isTokenExpired(token)) {
    removeAuthKeys();
    return null;
  }
  return token;
}

export function getUser() {
  if (!getToken()) return null;
  const raw = getAuthStorage()?.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function updateStoredUser(partialUser = {}) {
  const token = getToken();
  const currentUser = getUser();
  if (!token || !currentUser) return null;

  const persist = Boolean(localStorage.getItem(TOKEN_KEY));
  const user = {
    ...currentUser,
    ...partialUser,
    avatarUrl:
      partialUser.avatarUrl ||
      partialUser.avatar_url ||
      currentUser.avatarUrl ||
      currentUser.avatar_url ||
      null,
  };
  delete user.avatar_url;

  saveAuth({ token, user }, persist);
  return user;
}

export function clearAuth() {
  removeAuthKeys();
  notifyAuthChanged();
}
