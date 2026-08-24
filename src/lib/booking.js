/**
 * Owner Booking helpers
 * - อ่าน query จาก URL
 * - คำนวณชั่วโมง / ราคา preview
 * - format วัน–เวลาสำหรับ UI
 * - normalize sitter/pet จาก API → รูปทรงที่ UI ใช้
 */

const TIME_PATTERN = /^(\d{1,2}):(\d{2})$/;
const FALLBACK_AVATAR = "/navbar/profile.png";

function firstString(...values) {
  return values.find((value) => typeof value === "string" && value.trim()) ?? "";
}

/** "07:00" → นาทีจากเที่ยงคืน (invalid → null) */
export function parseTimeToMinutes(time) {
  const match = TIME_PATTERN.exec(String(time ?? "").trim());
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  return hours * 60 + minutes;
}

/** เช่น 07:00–10:00 → 3 */
export function calculateBookingHours(startTime, endTime) {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return null;
  }

  return (endMinutes - startMinutes) / 60;
}

// URL contract (Entry Flow): ?sitterId=&date=&startTime=&endTime=
const REQUIRED_PARAMS = ["sitterId", "date", "startTime", "endTime"];

/**
 * ตรวจ query แล้ว map เป็นค่าใช้ใน UI
 */
export function parseBookingParams(searchParams) {
  const values = Object.fromEntries(
    REQUIRED_PARAMS.map((key) => [key, String(searchParams?.[key] ?? "").trim()]),
  );

  const missing = REQUIRED_PARAMS.filter((key) => !values[key]);
  if (missing.length > 0) {
    return { valid: false, missing };
  }

  const hours = calculateBookingHours(values.startTime, values.endTime);
  if (hours === null) {
    return {
      valid: false,
      error: "Invalid time range. End time must be after start time (HH:mm).",
    };
  }

  return {
    valid: true,
    sitterId: values.sitterId,
    date: values.date,
    startTime: values.startTime,
    endTime: values.endTime,
    hours,
  };
}

/** ราคา preview: ตัวแรก 200/ชม. ตัวถัดไป +100/ชม. (FE เท่านั้น — POST ห้ามส่ง total) */
export function calculateBookingTotal(hours, petCount) {
  if (!hours || petCount < 1) return 0;
  return hours * (200 + 100 * (petCount - 1));
}

/** "2023-08-25" → "25 Aug, 2023" */
export function formatBookingDate(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  const formatted = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return formatted.replace(/^(\d+ \w+) (\d+)$/, "$1, $2");
}

/** "07:00" → "7 AM" */
export function formatTime12Hour(time) {
  const minutes = parseTimeToMinutes(time);
  if (minutes === null) return time;

  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;

  if (mins === 0) return `${hours12} ${period}`;
  return `${hours12}:${String(mins).padStart(2, "0")} ${period}`;
}

/** "7 AM - 10 AM" */
export function formatTimeRange(startTime, endTime) {
  return `${formatTime12Hour(startTime)} - ${formatTime12Hour(endTime)}`;
}

/** GET /api/sitters/:id → รูปทรง sidebar / eligibility */
export function normalizeBookingSitter(raw) {
  if (!raw || typeof raw !== "object") return null;

  const petTypes = (raw.petTypes ?? raw.pet_types ?? [])
    .map((type) => String(type).toLowerCase().trim())
    .filter(Boolean);

  return {
    id: String(raw.id ?? raw.user_id ?? ""),
    displayName: firstString(
      raw.display_name,
      raw.displayName,
      raw.title,
      raw.tradeName,
      "Pet Sitter",
    ),
    sitterName: firstString(raw.sitterName, raw.sitter_name, raw.name),
    avatarUrl: firstString(raw.avatarUrl, raw.avatar_url) || FALLBACK_AVATAR,
    petTypes,
  };
}

/** GET /api/users/me/pets item → การ์ด Your Pet */
export function normalizeBookingPet(raw) {
  if (!raw || typeof raw !== "object") return null;

  return {
    id: String(raw.id ?? ""),
    name: firstString(raw.name) || "Pet",
    petType: String(raw.petType ?? raw.pet_type ?? raw.type ?? "")
      .toLowerCase()
      .trim(),
    avatarUrl:
      firstString(raw.avatarUrl, raw.avatar_url, raw.image_url, raw.image) ||
      FALLBACK_AVATAR,
  };
}
