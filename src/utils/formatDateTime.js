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

/** 24 Aug, 7 AM - 10 AM */
export function formatBookedDateList(booking) {
  if (!booking?.start_date) return "—";
  const start = `${formatDay(booking.start_date)}, ${formatTime(booking.start_time)}`;
  const end = formatTime(booking.end_time);
  return `${start} - ${end}`;
}

/** 16 Oct 2022 | 7 AM - 10 AM */
export function formatBookedDateDetail(booking) {
  if (!booking?.start_date) return "—";
  const date = formatDate(booking.start_date);
  const start = formatTime(booking.start_time);
  const end = formatTime(booking.end_time);
  return `${date} | ${start} - ${end}`;
}
