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

/**
 * จำนวนคืน many-days — endDate − startDate (ไม่ inclusive)
 * 27→29 Aug = 2 | วันเดียว (start === end) = 0
 */
export function calculateBookingNights(startDate, endDate) {
  const start = normalizeBookingDate(startDate);
  const end = normalizeBookingDate(endDate);
  if (!start || !end) return null;

  const startMs = new Date(`${start}T00:00:00`).getTime();
  const endMs = new Date(`${end}T00:00:00`).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs < startMs) return null;

  return Math.round((endMs - startMs) / (24 * 60 * 60 * 1000));
}

/** endDate > startDate → many-days (per night) */
export function isManyDayBooking(startDate, endDate) {
  const nights = calculateBookingNights(startDate, endDate);
  return nights !== null && nights > 0;
}

// URL: ?sitterId=&startDate=&endDate=&startTime=&endTime=
// legacy one-day: ?sitterId=&date=&startTime=&endTime=

/**
 * อ่าน query หน้าจอง — รองรับ startDate+endDate หรือ date (one-day เดิม)
 */
export function parseBookingParams(searchParams) {
  const sitterId = String(searchParams?.sitterId ?? "").trim();
  const startTime = String(searchParams?.startTime ?? "").trim();
  const endTime = String(searchParams?.endTime ?? "").trim();

  let startDate = normalizeBookingDate(searchParams?.startDate);
  let endDate = normalizeBookingDate(searchParams?.endDate);
  const legacyDate = normalizeBookingDate(searchParams?.date);

  // legacy: date เดียว → one day
  if (!startDate && legacyDate) {
    startDate = legacyDate;
    endDate = legacyDate;
  }
  if (startDate && !endDate) {
    endDate = startDate;
  }

  const missing = [];
  if (!sitterId) missing.push("sitterId");
  if (!startTime) missing.push("startTime");
  if (!endTime) missing.push("endTime");
  if (!startDate) {
    missing.push(legacyDate || searchParams?.startDate ? "startDate" : "startDate or date");
  }

  if (missing.length > 0) {
    return { valid: false, missing };
  }

  if (endDate < startDate) {
    return {
      valid: false,
      error: "End date must be on or after start date.",
    };
  }

  const isManyDays = isManyDayBooking(startDate, endDate);
  const nights = isManyDays ? calculateBookingNights(startDate, endDate) : null;

  // one day: ต้องคิดชั่วโมงได้ | many days: เวลาเป็น check-in/out (ไม่ใช้คิดราคา)
  let hours = null;
  if (!isManyDays) {
    hours = calculateBookingHours(startTime, endTime);
    if (hours === null) {
      return {
        valid: false,
        error: "Invalid time range. End time must be after start time (HH:mm).",
      };
    }
  } else {
    if (!nights || nights < 1) {
      return {
        valid: false,
        error: "Many-day bookings need at least one night between start and end date.",
      };
    }
    const proposedStart = combineBookingDateTime(startDate, startTime);
    const proposedEnd = combineBookingDateTime(endDate, endTime);
    if (!proposedStart || !proposedEnd || proposedEnd <= proposedStart) {
      return {
        valid: false,
        error: "Check-out must be after check-in.",
      };
    }
  }

  return {
    valid: true,
    sitterId,
    startDate,
    endDate,
    startTime,
    endTime,
    isManyDays,
    nights,
    hours,
    date: startDate, // legacy alias (parse จาก ?date=)
  };
}

/** ราคา preview one-day: ตัวแรก 200/ชม. ตัวถัดไป +100/ชม. (FE เท่านั้น — POST ห้ามส่ง total) */
export function calculateBookingTotal(hours, petCount) {
  if (!hours || petCount < 1) return 0;
  return hours * (200 + 100 * (petCount - 1));
}

/** ราคา preview many-days: คืนละ 1000, ตัวถัดไป +500/คืน */
export function calculateNightlyTotal(nights, petCount) {
  if (!nights || nights < 1 || petCount < 1) return 0;
  return nights * (1000 + 500 * (petCount - 1));
}

/** รวม preview ตามโหมด — ใช้ใน sidebar/confirm (ticket 02–03) */
export function calculateBookingPreviewTotal({ isManyDays, hours, nights, petCount }) {
  if (isManyDays) return calculateNightlyTotal(nights, petCount);
  return calculateBookingTotal(hours, petCount);
}

/**
 * แสดง duration จาก API/list — "hours" → "5 hours", "Day" → "2 nights"
 */
export function formatBookingDuration(duration, durationUnit) {
  const value = Number(duration);
  if (!Number.isFinite(value) || value < 1) return "";

  const unit = String(durationUnit ?? "").trim();
  if (unit === "Day") {
    return value === 1 ? "1 night" : `${value} nights`;
  }
  if (unit === "hours") {
    return value === 1 ? "1 hour" : `${value} hours`;
  }
  return `${value} ${unit}`;
}

/**
 * ticket 04: อ่าน duration จาก list/detail API (snake_case)
 * ใหม่: duration + duration_unit | legacy: duration_hours → "hours"
 */
export function formatBookingDurationFromRecord(booking) {
  if (!booking || typeof booking !== "object") return "—";

  const hasNewFields =
    booking.duration != null && String(booking.duration_unit ?? "").trim() !== "";
  const duration = hasNewFields ? booking.duration : booking.duration_hours;
  const durationUnit = hasNewFields
    ? booking.duration_unit
    : booking.duration_hours != null
      ? "hours"
      : "";

  const formatted = formatBookingDuration(duration, durationUnit);
  return formatted || "—";
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

/**
 * ข้อความ Date & Time บน Sidebar / Thank You
 * One day: "1 Sep, 2026 | 10 AM - 1 PM" | Many days: แค่ช่วงวัน (ไม่แสดงเวลา)
 */
export function formatBookingDateTimeLabel({
  startDate,
  endDate,
  startTime,
  endTime,
  isManyDays,
}) {
  const dateLabel = isManyDays
    ? `${formatBookingDate(startDate)} - ${formatBookingDate(endDate)}`
    : formatBookingDate(startDate);

  if (isManyDays) return dateLabel;

  return `${dateLabel} | ${formatTimeRange(startTime, endTime)}`;
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

/** Overlap ตามโหมด — one day เช็ควันเดียว, many days เช็คทั้งช่วง */
export function bookingSelectionOverlapsBooked({
  startDate,
  endDate,
  startTime,
  endTime,
  isManyDays,
  bookedSlots,
}) {
  if (isManyDays) {
    return bookingRangeOverlapsBooked(
      startDate,
      endDate,
      startTime,
      endTime,
      bookedSlots,
    );
  }
  return slotOverlapsBooked(startDate, startTime, endTime, bookedSlots);
}

/** True when every possible time span from startDate to endDate would hit a booked slot */
export function dateSpanMustOverlapBooked(startDate, endDate, bookedSlots) {
  if (!startDate || !endDate || startDate >= endDate) return false;
  return bookingRangeOverlapsBooked(startDate, endDate, "23:00", "00:00", bookedSlots);
}

/** Many-days (date only): occupy 00:00 on start through end of endDate */
export function dateRangeOverlapsBooked(startDate, endDate, bookedSlots) {
  if (!startDate) return false;
  return bookingRangeOverlapsBooked(
    startDate,
    endDate || startDate,
    "00:00",
    "24:00",
    bookedSlots,
  );
}

export function dateHasBookedSlot(dateKey, bookedSlots) {
  return (bookedSlots ?? []).some((slot) => slot.date === dateKey);
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
