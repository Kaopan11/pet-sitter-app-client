/**
 * Owner Booking helpers
 * - อ่าน query จาก URL
 * - คำนวณชั่วโมง / ราคา preview
 * - format วัน–เวลาสำหรับ UI
 * - normalize sitter/pet/guest จาก API → รูปทรงที่ UI ใช้
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

export function normalizeBookingDate(value) {
  const text = String(value ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : "";
}

export function normalizeBookingTime(value) {
  const match = /^(\d{1,2}):(\d{2})/.exec(String(value ?? "").trim());
  if (!match) return "";
  return `${String(Number(match[1])).padStart(2, "0")}:${match[2]}`;
}

export function normalizeBookedSlots(rows) {
  if (!Array.isArray(rows)) return [];

  const slots = [];
  for (const row of rows) {
    const startDate = normalizeBookingDate(
      row.startDate ?? row.start_date ?? row.date ?? row.booking_date ?? row.bookingDate,
    );
    const endDate =
      normalizeBookingDate(row.endDate ?? row.end_date) || startDate;
    const startTime = normalizeBookingTime(row.startTime ?? row.start_time);
    const endTime = normalizeBookingTime(row.endTime ?? row.end_time);
    if (!startDate || !startTime || !endTime) continue;

    slots.push(...expandBookedRange({ startDate, endDate, startTime, endTime }));
  }

  return slots;
}

function toDateKeyFromParts(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function expandBookedRange({ startDate, endDate, startTime, endTime }) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    if (startTime < endTime) {
      return [{ date: startDate, startTime, endTime }];
    }
    return [];
  }

  const slots = [];
  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const date = toDateKeyFromParts(cursor);
    let dayStart = "00:00";
    let dayEnd = "24:00";

    if (date === startDate && date === endDate) {
      dayStart = startTime;
      dayEnd = endTime;
    } else if (date === startDate) {
      dayStart = startTime;
    } else if (date === endDate) {
      dayEnd = endTime;
    }

    if (dayStart < dayEnd) {
      slots.push({ date, startTime: dayStart, endTime: dayEnd });
    }
  }

  return slots;
}

/** "2026-08-30" + "00:00" → that calendar day at midnight; "24:00" → next midnight */
export function combineBookingDateTime(dateKey, timeValue) {
  const date = normalizeBookingDate(dateKey);
  const time = timeValue === "24:00" ? "24:00" : normalizeBookingTime(timeValue);
  if (!date || !time) return null;

  const [year, month, day] = date.split("-").map(Number);
  if ([year, month, day].some((part) => Number.isNaN(part))) return null;

  if (time === "24:00") {
    return new Date(year, month - 1, day + 1, 0, 0, 0, 0);
  }

  const [hour, minute] = time.split(":").map(Number);
  if ([hour, minute].some((part) => Number.isNaN(part))) return null;
  return new Date(year, month - 1, day, hour, minute || 0, 0, 0);
}

export function isTimeInsideBookedSlot(date, time, bookedSlots) {
  const instant = combineBookingDateTime(date, time);
  if (!instant) return false;

  return (bookedSlots ?? []).some((slot) => {
    const slotStart = combineBookingDateTime(slot.date, slot.startTime);
    const slotEnd = combineBookingDateTime(slot.date, slot.endTime);
    return Boolean(slotStart && slotEnd && instant >= slotStart && instant < slotEnd);
  });
}

export function bookingRangeOverlapsBooked(
  startDate,
  endDate,
  startTime,
  endTime,
  bookedSlots,
) {
  const proposedStart = combineBookingDateTime(startDate, startTime);
  const proposedEnd = combineBookingDateTime(endDate || startDate, endTime);
  if (!proposedStart || !proposedEnd || proposedEnd <= proposedStart) return false;

  return (bookedSlots ?? []).some((slot) => {
    const slotStart = combineBookingDateTime(slot.date, slot.startTime);
    const slotEnd = combineBookingDateTime(slot.date, slot.endTime);
    return Boolean(
      slotStart && slotEnd && proposedStart < slotEnd && slotStart < proposedEnd,
    );
  });
}

export function slotOverlapsBooked(date, startTime, endTime, bookedSlots) {
  return bookingRangeOverlapsBooked(date, date, startTime, endTime, bookedSlots);
}

/** True when every possible time span from startDate to endDate would hit a booked slot */
export function dateSpanMustOverlapBooked(startDate, endDate, bookedSlots) {
  if (!startDate || !endDate || startDate >= endDate) return false;
  return bookingRangeOverlapsBooked(startDate, endDate, "23:00", "00:00", bookedSlots);
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

/** GET /api/users/me → guest บน Step Information (read-only) */
export function normalizeBookingGuest(raw) {
  if (!raw || typeof raw !== "object") {
    return { name: "", email: "", phone: "" };
  }

  return {
    name: firstString(raw.name) || "",
    email: firstString(raw.email) || "",
    phone: firstString(raw.phone) || "",
  };
}
