/** 7:00:00 → 7 AM */
export function formatTime(time) {
  if (!time) return "";
  const hour = Number(String(time).split(":")[0]);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12} ${period}`;
}

/** 2026-08-24 → 24 Aug */
export function formatDay(value) {
  if (!value) return "";
  const date = new Date(value);
  return `${date.getDate()} ${date.toLocaleString("en-GB", { month: "short" })}`;
}

/** 2022-10-16 → 16 Oct 2022 */
export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  const day = date.getDate();
  const month = date.toLocaleString("en-GB", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/** 14:32 */
export function formatMessageTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function isNightBooking(booking) {
  return String(booking?.duration_unit ?? "").trim() === "Day";
}

/** 24 Aug, 7 AM - 10 AM · รายคืน: 4 Sept - 6 Sept */
export function formatBookedDateList(booking) {
  if (!booking?.start_date) return "—";

  if (isNightBooking(booking)) {
    const start = formatDay(booking.start_date);
    if (booking.end_date && booking.end_date !== booking.start_date) {
      return `${start} - ${formatDay(booking.end_date)}`;
    }
    return start;
  }

  const startDateAndTime = `${formatDay(booking.start_date)}, ${formatTime(booking.start_time)}`;
  const endTime = formatTime(booking.end_time);
  if (booking.end_date && booking.end_date !== booking.start_date) {
    return `${startDateAndTime} - ${formatDay(booking.end_date)}, ${endTime}`;
  }
  return `${startDateAndTime} - ${endTime}`;
}

/** 16 Oct 2022 | 7 AM - 10 AM · รายคืน: ไม่โชว์เวลา */
export function formatBookedDateDetail(booking) {
  if (!booking?.start_date) return "—";

  const startDate = formatDate(booking.start_date);
  if (isNightBooking(booking)) {
    if (booking.end_date && booking.end_date !== booking.start_date) {
      return `${startDate} - ${formatDate(booking.end_date)}`;
    }
    return startDate;
  }

  const startTime = formatTime(booking.start_time);
  const endTime = formatTime(booking.end_time);
  if (booking.end_date && booking.end_date !== booking.start_date) {
    return `${startDate} | ${startTime} - ${formatDate(booking.end_date)} | ${endTime}`;
  }
  return `${startDate} | ${startTime} - ${endTime}`;
}
