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

function getAuthStorage() {
  if (typeof window === "undefined") return null;
  if (localStorage.getItem(TOKEN_KEY)) return localStorage;
  if (sessionStorage.getItem(TOKEN_KEY)) return sessionStorage;
  return null;
}

export function getToken() {
  return getAuthStorage()?.getItem(TOKEN_KEY) ?? null;
}

export function getUser() {
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
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth-changed"));
  }
  return user;
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}
