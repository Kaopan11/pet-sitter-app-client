// src/lib — คุยกับ backend / เก็บ session
// เรียก API ตาม NEXT_PUBLIC_API_URL จาก .env.example (local:4000 | prod: Render)
import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function assertApiUrl() {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not set. Add it to .env.example.");
  }
}

async function apiFetch(path, { method = "GET", body } = {}) {
  assertApiUrl();

  const token = getToken();
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const headers = {};
  if (body && !isFormData) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    cache: "no-store",
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
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

export async function getSitters({
  q = "",
  petTypes = [],
  rating = null,
  experience = "",
  page = 1,
  limit = 5,
} = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (petTypes.length) params.set("petTypes", petTypes.join(","));
  if (rating) params.set("rating", String(rating));
  if (experience) params.set("experience", experience);
  params.set("page", String(page));
  params.set("limit", String(limit));

  const json = await apiFetch(`/api/sitters?${params.toString()}`);
  return {
    data: json.data ?? [],
    pagination: json.pagination ?? {
      page,
      limit,
      total: 0,
      totalPages: 0,
    },
  };
}

export async function getSitter(id) {
  const json = await apiFetch(`/api/sitters/${encodeURIComponent(id)}`);
  return json.data;
}

/** สัตว์เลี้ยงของ owner ที่ login — Day 2 booking */
export async function getMyPets() {
  const json = await apiFetch("/api/users/me/pets");
  return json.data ?? [];
}

// สำเร็จ → { token, user } | ล้มเหลว → โยน Error จาก json.message
export async function login({ email, password }) {
  const json = await apiFetch("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
  return json.data;
}

// asSitter true = สร้าง sitter_profiles (pending) | false = owner
export async function register({ name, email, phone, password, asSitter }) {
  const json = await apiFetch("/api/auth/register", {
    method: "POST",
    body: { name, email, phone, password, asSitter },
  });
  return json.data;
}

// owner ที่ login แล้วกด Become a Pet Sitter → ใช้ logic เดียวกับ register asSitter
export async function becomeSitter() {
  const json = await apiFetch("/api/auth/become-sitter", {
    method: "POST",
  });
  return json.data;
}

//ยิง api บน owner profile
export async function getProfile() {
  const json = await apiFetch("/api/users/me", {});
  return json.data;
}

// บันทึกโปรไฟล์
export async function updateProfile({
  name,
  email,
  phone,
  id_number,
  date_of_birth,
}) {
  const json = await apiFetch("/api/users/me", {
    method: "PUT",
    body: { name, email, phone, id_number, date_of_birth },
  });
  return json.data;
}

export async function createConversation(otherUserId) {
  const json = await apiFetch("/api/conversations", {
    method: "POST",
    body: { otherUserId, sitterId: otherUserId },
  });
  return json.data;
}

export async function getConversations() {
  const json = await apiFetch("/api/conversations");
  return json.data ?? [];
}

export async function getMessages(conversationId) {
  const json = await apiFetch(
    `/api/conversations/${encodeURIComponent(conversationId)}/messages`,
  );
  return json.data ?? [];
}

export async function sendMessage(conversationId, { content = "", imageFile } = {}) {
  const formData = new FormData();
  formData.append("content", content);
  if (imageFile) formData.append("image", imageFile);

  const json = await apiFetch(
    `/api/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: "POST",
      body: formData,
    },
  );
  return json.data;
}
