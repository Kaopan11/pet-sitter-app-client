// src/lib — คุยกับ backend / เก็บ session
// เรียก API ตาม NEXT_PUBLIC_API_URL จาก .env.example (local:4000 | prod: Render)
import { clearAuth, getToken } from "@/lib/auth";
import { formatDate } from "@/utils/formatDateTime";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function assertApiUrl() {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not set. Add it to .env.example.");
  }
}

export async function apiFetch(path, { method = "GET", body } = {}) {
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
    const message = String(json.message || json.error || "");
    if (
      res.status === 401 &&
      token &&
      message.toLowerCase().includes("unauthorized")
    ) {
      clearAuth();
    }
    // ติด status ไว้ให้ UI แยก 400 / 401 ได้ (เช่น reset-password)
    const error = new Error(json.message || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }

  return json;
}

//createPet(formData) / updatePet(id, formData) → เรียก apiFormFetch
async function apiFormFetch(path, { method = "POST", body } = {}) {
  assertApiUrl();
  const token = getToken(); //line 40-42: get token from getToken function in auth.js send to backend along with formdata
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, {
    //`${API_URL}${path}`= 'http://localhost:4000/api/pets'
    method, //line 45-48: objects
    cache: "no-store",
    headers, //line 47-48: headers: {Authorization: `Bearer ${token}`}
    body, // FormData ตรง ๆ ไม่ stringify
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = String(json.message || json.error || "");
    if (
      res.status === 401 &&
      token &&
      message.toLowerCase().includes("unauthorized")
    ) {
      clearAuth();
    }
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
  const ratings = (Array.isArray(rating) ? rating : rating != null ? [rating] : [])
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => value >= 1 && value <= 5);
  const uniqueRatings = [...new Set(ratings)];

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (petTypes.length) params.set("petTypes", petTypes.join(","));
  if (uniqueRatings.length) params.set("rating", uniqueRatings.join(","));
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

/** ช่วงเวลาที่ sitter ถูกจองแล้ว — ใช้ disable ปฏิทิน / เวลา */
export async function getSitterAvailability(id) {
  const json = await apiFetch(
    `/api/sitters/${encodeURIComponent(id)}/availability`,
  );
  return json.data ?? [];
}

/** สัตว์เลี้ยงของ owner ที่ login — Day 2 booking */
export async function getMyPets() {
  const json = await apiFetch("/api/users/me/pets");
  return json.data ?? [];
}

export async function getSitterReviews(id, { page = 1, limit = 5, rating = null } = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (rating) params.set("rating", String(rating));

  const json = await apiFetch(
    `/api/sitters/${encodeURIComponent(id)}/reviews?${params.toString()}`
  );
  const data = json.data ?? json.reviews ?? [];

  return {
    data: Array.isArray(data) ? data : [],
    pagination: json.pagination ?? {
      page,
      limit,
      total: Array.isArray(data) ? data.length : 0,
      totalPages: 0,
    },
    summary: json.summary ?? {
      rating_avg: 0,
      review_count: 0,
    },
  };
}

// สำเร็จ → { token, user } | ล้มเหลว → โยน Error จาก json.message
export async function login({ email, password }) {
  const json = await apiFetch("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
  return json.data;
}

/**
 * ลืมรหัส — BE ส่งเมลรีเซ็ต (ถ้ามีบัญชี)
 * สำเร็จ 200: ข้อความกลางๆ เสมอ (กันเดาว่าอีเมลมีในระบบ)
 * ล้มเหลว 400: อีเมลผิดรูป ฯลฯ → throw Error(message)
 */
export async function forgotPassword({ email }) {
  const json = await apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
  // คืน message ให้ UI เอาไป toast ได้ตรงๆ
  return {
    message:
      json.message ||
      "If an account exists for this email, a reset link has been sent.",
  };
}

/**
 * ตั้งรหัสใหม่จากลิงก์ในเมล (ticket 03)
 * body: { accessToken จาก Supabase, newPassword > 8 ตัว }
 * สำเร็จ 200 → message | 401 token หมดอายุ | 400 รหัสสั้น/ไม่มี token
 */
export async function resetPassword({ accessToken, newPassword }) {
  const json = await apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: { accessToken, newPassword },
  });
  return {
    message: json.message || "Password updated successfully",
  };
}

/**
 * หลัง OAuth — เช็คว่ามีโปรไฟล์ในระบบเราแล้วหรือยัง (ticket 04)
 * ใช้ Bearer จาก Supabase access_token (ยังไม่ผ่าน getToken ของแอป)
 * 200 → { token, user } | 404 Profile incomplete | 401 token ไม่ผ่าน
 */
export async function getAuthMe(accessToken) {
  assertApiUrl();

  if (!accessToken) {
    const error = new Error("Missing access token");
    error.status = 401;
    throw error;
  }

  const res = await fetch(`${API_URL}/api/auth/me`, {
    method: "GET",
    cache: "no-store",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(json.message || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }

  // รูปเดียวกับ login: data = { token, user }
  return json.data;
}

/**
 * กรอก name + phone ครั้งแรกหลัง Social (ticket 05)
 * Header: Bearer จาก Supabase (pending token)
 * 200 → { token, user } เป็น Owner | 409 เบอร์ซ้ำ
 */
export async function completeOAuthProfile({ accessToken, name, phone }) {
  assertApiUrl();

  if (!accessToken) {
    const error = new Error("Missing access token");
    error.status = 401;
    throw error;
  }

  const res = await fetch(`${API_URL}/api/auth/oauth/complete`, {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, phone }),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(json.message || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }

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

/**
 * สร้าง booking — cash | stripe
 * many days: startDate + endDate เท่านั้น · one day: + startTime/endTime
 */
export async function createBooking({
  sitterId,
  startDate,
  endDate,
  date,
  startTime,
  endTime,
  petIds,
  message,
  paymentMethod = "cash",
  isManyDays = false,
}) {
  const resolvedStart = startDate ?? date;
  const resolvedEnd = endDate ?? date ?? resolvedStart;

  // Step 1: ฟิลด์ร่วมทุกโหมด
  const body = {
    sitterId,
    startDate: resolvedStart,
    endDate: resolvedEnd,
    petIds,
    paymentMethod,
  };

  // Step 2: one day เท่านั้นที่ส่ง time (many days omit ตาม BE contract)
  if (!isManyDays) {
    body.startTime = startTime;
    body.endTime = endTime;
  }

  const trimmedMessage = typeof message === "string" ? message.trim() : "";
  if (trimmedMessage) {
    body.message = trimmedMessage;
  }

  const json = await apiFetch("/api/bookings", {
    method: "POST",
    body,
  });
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

//mapPet เป็น ตัวแปลงชื่อฟิลด์ จากของที่ backend ส่งมา ให้กลายเป็นชื่อที่หน้า UI ใช้อยู่แล้ว
export function mapPet(pet) {
  if (!pet) return null;
  return {
    id: pet.id,
    name: pet.name ?? "",
    type: pet.pet_type ?? "",
    breed: pet.breed ?? "",
    sex: pet.sex ?? "",
    age: pet.age_months == null ? "" : String(pet.age_months),
    color: pet.color ?? "",
    weight: pet.weight_kg == null ? "" : String(pet.weight_kg),
    about: pet.about ?? "",
    image: pet.avatar_url ?? "",
    isSuspended: Boolean(pet.is_suspended ?? pet.isSuspended),
  };
}

// รายการ pet ของ owner ที่ login — หน้า /owner/pets (ไม่ใช้ร่วมกับ booking)
export async function getOwnerPets() {
  const json = await apiFetch("/api/pets");
  const pets = Array.isArray(json.data) ? json.data : [];
  return pets.map(mapPet).filter(Boolean);
}

// หน้า /owner/pets/[id] — ดึงตัวเดียวจาก API ไม่ใช้ mock
export async function getOwnerPet(id) {
  try {
    const json = await apiFetch(`/api/pets/${encodeURIComponent(id)}`);
    return mapPet(json.data);
  } catch (error) {
    const pets = await getOwnerPets();
    const pet = pets.find((item) => String(item.id) === String(id)) ?? null;
    if (pet) return pet;
    throw error;
  }
}

//รับ formData
export async function createPet(formData) {
  const json = await apiFormFetch("/api/pets", { method: "POST", body: formData,});
  return mapPet(json.data);
}

export async function deletePet(id) {
  await apiFetch(`/api/pets/${encodeURIComponent(id)}`, { method: "DELETE" });
}
//apiFormFectch is to validate data from frontend and send the data to backend later (endpoint method, attached formdata)

export async function updatePet(id, formData) {
  const json = await apiFormFetch(`/api/pets/${encodeURIComponent(id)}`, {
    method: "PUT", // หรือ PATCH ตามที่ backend ใช้
    body: formData,
  });
  return mapPet(json.data);
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

export async function getNotifications() {
  const json = await apiFetch("/api/notifications");
  return json.data ?? { items: [], unreadCount: 0 };
}

export async function markNotificationRead(id) {
  const json = await apiFetch(
    `/api/notifications/${encodeURIComponent(id)}/read`,
    { method: "PATCH" },
  );
  return json.data ?? { items: [], unreadCount: 0 };
}

export async function markAllNotificationsRead() {
  const json = await apiFetch("/api/notifications/read-all", {
    method: "PATCH",
  });
  return json.data ?? { items: [], unreadCount: 0 };
}

export async function getMessages(conversationId) {
  const json = await apiFetch(
    `/api/conversations/${encodeURIComponent(conversationId)}/messages`,
  );
  return json.data ?? [];
}

export async function markConversationRead(conversationId) {
  await apiFetch(
    `/api/conversations/${encodeURIComponent(conversationId)}/read`,
    { method: "POST" },
  );
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

function formatOwnerPhone(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length !== 10) return value || "—";
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

function formatOwnerIdNumber(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length !== 13) return value || "—";
  return `${digits.slice(0, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
}

function formatOwnerDob(value) {
  if (!value) return "—";
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return formatDate(value) || "—";
  const date = new Date(year, month - 1, day);
  return `${day} ${date.toLocaleString("en-GB", { month: "short" })} ${year}`;
}

function formatPetAge(months) {
  if (months == null || months === "") return "—";
  const count = Number(months);
  if (Number.isNaN(count)) return String(months);
  if (count < 12) return `${count} Month${count === 1 ? "" : "s"}`;
  const years = Math.floor(count / 12);
  const rest = count % 12;
  const yearLabel = `${years} Year${years === 1 ? "" : "s"}`;
  if (rest === 0) return yearLabel;
  return `${yearLabel} ${rest} Month${rest === 1 ? "" : "s"}`;
}

function mapOwnerPet(pet) {
  if (!pet || typeof pet !== "object") return null;
  const months = pet.age_months ?? pet.age;
  return {
    id: String(pet.id),
    name: pet.name ?? "—",
    type: pet.pet_type ?? pet.type ?? "",
    breed: pet.breed || "—",
    sex: pet.sex || "—",
    age: formatPetAge(months),
    color: pet.color || "—",
    weight:
      pet.weight_kg != null ? `${pet.weight_kg} Kilogram` : pet.weight || "—",
    about: pet.about || "—",
    image: pet.avatar_url ?? pet.image ?? "",
    isSuspended: Boolean(pet.is_suspended ?? pet.isSuspended),
  };
}

function mapOwnerReview(review) {
  if (!review || typeof review !== "object") return null;
  return {
    id: String(review.id),
    sitterName: review.sitter_name ?? review.sitterName ?? "Pet Sitter",
    sitterAvatar: review.sitter_avatar_url ?? review.sitterAvatar ?? "",
    date: formatDate(review.created_at ?? review.date) || "—",
    rating: Number(review.rating ?? 0) || 0,
    comment: review.comment ?? review.content ?? "",
  };
}

function mapAdminOwnerListItem(row) {
  return {
    id: row.id,
    name: row.name ?? row.full_name ?? "—",
    phone: formatOwnerPhone(row.phone),
    email: row.email || "—",
    pets: row.pet_count ?? row.pets_count ?? 0,
    status: row.status === "Banned" || row.is_banned ? "Banned" : "Normal",
    avatar: row.avatar_url ?? row.avatar ?? "",
  };
}

function mapAdminOwner(row) {
  if (!row || typeof row !== "object") return null;
  return {
    id: row.id,
    name: row.name ?? row.full_name ?? "Pet Owner",
    phone: formatOwnerPhone(row.phone),
    email: row.email || "—",
    idCard: formatOwnerIdNumber(row.id_number ?? row.idCard),
    dob: formatOwnerDob(row.date_of_birth ?? row.dob),
    status: row.status === "Banned" || row.is_banned ? "Banned" : "Normal",
    avatar: row.avatar_url ?? row.avatar ?? "",
    pets: Array.isArray(row.pets) ? row.pets.map(mapOwnerPet).filter(Boolean) : [],
    reviews: Array.isArray(row.reviews)
      ? row.reviews.map(mapOwnerReview).filter(Boolean)
      : [],
  };
}

export async function getAdminOwners({ search = "", page = 1, limit = 8 } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  params.set("page", String(page));
  params.set("limit", String(limit));

  const json = await apiFetch(`/api/admin/owners?${params.toString()}`);
  return {
    rows: (json.data ?? []).map(mapAdminOwnerListItem),
    currentPage: json.currentPage ?? page,
    totalPages: json.totalPages ?? 1,
  };
}

export async function getAdminOwner(id) {
  const json = await apiFetch(`/api/admin/owners/${encodeURIComponent(id)}`);
  const owner = mapAdminOwner(json.data);
  if (!owner) {
    const error = new Error("Pet owner not found");
    error.status = 404;
    throw error;
  }
  return owner;
}

export async function setAdminOwnerBan(id, isBanned) {
  const json = await apiFetch(`/api/admin/owners/${encodeURIComponent(id)}/ban`, {
    method: "PATCH",
    body: { is_banned: isBanned },
  });
  return json.data;
}

export async function setAdminPetSuspend(ownerId, petId, isSuspended) {
  const json = await apiFetch(
    `/api/admin/owners/${encodeURIComponent(ownerId)}/pets/${encodeURIComponent(petId)}/suspend`,
    {
      method: "PATCH",
      body: { is_suspended: isSuspended },
    },
  );
  return mapOwnerPet(json.data);
}

function formatReportDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatReportStatus(value) {
  const status = String(value ?? "").trim().toLowerCase();
  if (status === "resolved") return "Resolved";
  if (status === "cancelled" || status === "canceled") return "Cancelled";
  return "Pending";
}

/** Map `reports` table / API row → admin list & detail fields */
export function mapAdminReport(row) {
  if (!row || typeof row !== "object") return null;

  const reporter =
    row.reporter ??
    row.reporter_name ??
    row.reported_by ??
    row.reporterName ??
    "";
  const target =
    row.target ??
    row.target_name ??
    row.reported_person ??
    row.sitter_name ??
    row.sitterName ??
    "";

  return {
    id: row.id,
    reporter: String(reporter),
    target: String(target),
    issue: String(row.issue ?? row.subject ?? ""),
    description: String(row.description ?? ""),
    date: formatReportDate(row.date ?? row.created_at ?? row.createdAt),
    status: formatReportStatus(row.status),
  };
}

export async function getReports() {
  const json = await apiFetch("/api/reports");
  const rows = Array.isArray(json.data) ? json.data : [];
  return rows.map(mapAdminReport).filter(Boolean);
}

export async function getReport(id) {
  const json = await apiFetch(`/api/reports/${encodeURIComponent(id)}`);
  return mapAdminReport(json.data);
}

//Update report status
export async function updateReportStatus(id, status) {
  const json = await apiFetch(`/api/reports/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: { status },
  });
  return mapAdminReport(json.data);
}

// export async function createPetReport(id, { content = "", imageFile } = {}) {
//   const formData = new FormData();
//   formData.append("content", content);
//   if (imageFile) formData.append("image", imageFile);

//   const json = await apiFetch(`/api/pets/${encodeURIComponent(id)}/reports`, {
//     method: "POST",
//     body: formData,
//   });
// }