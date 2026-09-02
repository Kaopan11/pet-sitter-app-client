"use client";

import Icon from "@/components/Icon";
import { formatBookingDate } from "@/lib/booking";

export const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const days = [];

  for (let index = firstDay - 1; index >= 0; index -= 1) {
    days.push({
      key: `prev-${daysInPrevMonth - index}`,
      date: new Date(year, month - 1, daysInPrevMonth - index),
      outside: true,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push({
      key: `current-${day}`,
      date: new Date(year, month, day),
      outside: false,
    });
  }

  const remainder = days.length % 7;
  if (remainder !== 0) {
    for (let day = 1; day <= 7 - remainder; day += 1) {
      days.push({
        key: `next-${day}`,
        date: new Date(year, month + 1, day),
        outside: true,
      });
    }
  }

  return days;
}

export function DateField({ value, placeholder, open, onToggle, children }) {
  return (
    <div className="relative min-w-0 flex-1">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={`input w-full cursor-pointer text-left ${
          value ? "text-black" : "text-gray-400"
        }`}
      >
        {formatBookingDate(value) || placeholder}
      </button>
      {children}
    </div>
  );
}

export function BookingCalendar({
  viewYear,
  viewMonth,
  calendarDays,
  onShiftMonth,
  isDateUnavailable,
  isHighlighted,
  isInRange,
  onSelect,
  hint,
  align = "start",
}) {
  return (
    <div
      className={`absolute top-[calc(100%+8px)] z-30 w-80 rounded-xl bg-white p-4 shadow-(--shadow-dropdown) ${
        align === "end" ? "right-0" : "left-0"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onShiftMonth(-1)}
          className="flex size-8 cursor-pointer items-center justify-center text-gray-400 hover:text-orange-500"
          aria-label="Previous month"
        >
          <Icon src="/icon/chevron-left.svg" className="h-4 w-4" />
        </button>
        <p className="text-body-2 font-bold text-black">
          {new Date(viewYear, viewMonth, 1).toLocaleDateString("en-GB", {
            month: "long",
            year: "numeric",
          })}
        </p>
        <button
          type="button"
          onClick={() => onShiftMonth(1)}
          className="flex size-8 cursor-pointer items-center justify-center text-gray-400 hover:text-orange-500"
          aria-label="Next month"
        >
          <Icon src="/icon/chevron-right.svg" className="h-4 w-4" />
        </button>
      </div>
      <div className="mb-1 grid grid-cols-7 text-center text-body-3 text-gray-400">
        {WEEKDAYS.map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {calendarDays.map((item) => {
          const key = toDateKey(item.date);
          const unavailable = isDateUnavailable(key, item);
          const highlighted = isHighlighted(key);
          const inRange = isInRange(key);

          return (
            <button
              key={item.key}
              type="button"
              disabled={unavailable}
              onClick={() => onSelect(item.date)}
              className={`mx-auto flex size-9 items-center justify-center rounded-full text-body-3 ${
                highlighted
                  ? "bg-orange-500 font-bold text-white"
                  : inRange
                    ? "bg-orange-100 font-medium text-orange-500"
                    : unavailable
                      ? "cursor-not-allowed text-gray-300"
                      : item.outside
                        ? "cursor-pointer text-gray-300 hover:bg-orange-100"
                        : "cursor-pointer text-black hover:bg-orange-100"
              }`}
            >
              {item.date.getDate()}
            </button>
          );
        })}
      </div>
      {hint ? <p className="mt-3 text-center text-body-3 text-gray-400">{hint}</p> : null}
    </div>
  );
}
