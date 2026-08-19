/**
 * Owner Booking helpers
 * - อ่าน query จาก URL
 * - คำนวณชั่วโมง / ราคา preview
 * - format วัน–เวลาสำหรับ UI
 */

const TIME_PATTERN = /^(\d{1,2}):(\d{2})$/;

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

// URL: ?sitter=&date=&from=&to=
const REQUIRED_PARAMS = ["sitter", "date", "from", "to"];

/**
 * ตรวจ query แล้ว map เป็นค่าใช้ใน UI
 * sitter→sitterId, from→startTime, to→endTime
 */
export function parseBookingParams(searchParams) {
  const values = Object.fromEntries(
    REQUIRED_PARAMS.map((key) => [key, String(searchParams?.[key] ?? "").trim()]),
  );

  const missing = REQUIRED_PARAMS.filter((key) => !values[key]);
  if (missing.length > 0) {
    return { valid: false, missing };
  }

  const hours = calculateBookingHours(values.from, values.to);
  if (hours === null) {
    return {
      valid: false,
      error: "Invalid time range. End time must be after start time (HH:mm).",
    };
  }

  return {
    valid: true,
    sitterId: values.sitter,
    date: values.date,
    startTime: values.from,
    endTime: values.to,
    hours,
  };
}

/** ราคา preview: ตัวแรก 200/ชม. ตัวถัดไป +100/ชม. (ชั่วคราวก่อนต่อ BE) */
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
