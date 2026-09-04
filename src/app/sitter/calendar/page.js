"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Icon from "@/components/Icon";
import LoadingState from "@/components/LoadingState";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const START_HOUR = 0;
const END_HOUR = 24;
const HOUR_COUNT = END_HOUR - START_HOUR;
const ROW_HEIGHT = 64;
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const EVENT_STYLES = {
  waiting_confirm: "border-2 border-pink bg-pink-light text-gray-600",
  waiting_service: "border-2 border-orange-400 bg-orange-100 text-gray-600",
  in_service: "border-2 border-orange-400 bg-orange-100 text-gray-600",
  success: "border-2 border-green bg-green-light text-gray-600",
};

const LEGEND = [
  { label: "Available", box: "border border-gray-200 bg-white" },
  { label: "Waiting for Confirm", box: "border border-pink bg-pink-light" },
  { label: "Booked", box: "border border-orange-400 bg-orange-100" },
  { label: "Success", box: "border border-green bg-green-light" },
];

function startOfWeek(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - next.getDay());
  return next;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(value) {
  const match = String(value ?? "").match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function parseMinutes(value) {
  if (!value) return null;
  if (String(value).startsWith("24:")) return 24 * 60;
  const [hour, minute] = String(value).split(":").map(Number);
  if (Number.isNaN(hour)) return null;
  return hour * 60 + (minute || 0);
}

function formatHourLabel(hour) {
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12} ${period}`;
}

function formatWeekRange(weekStart) {
  const weekEnd = addDays(weekStart, 6);
  const year = weekEnd.getFullYear();
  const startLabel = weekStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const endLabel = weekEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${weekStart.getDate()} — ${endLabel} ${year}`;
  }

  return `${startLabel} — ${endLabel} ${year}`;
}

function isVisibleStatus(status) {
  return Boolean(EVENT_STYLES[status]);
}

function bookingSegments(booking, weekDays) {
  const start = parseDateKey(booking.start_date);
  const end = parseDateKey(booking.end_date || booking.start_date);
  if (!start || !end) return [];

  const startKey = toDateKey(start);
  const endKey = toDateKey(end);
  const isManyDays = startKey !== endKey || String(booking.duration_unit ?? "") === "Day";
  const startMinutes = parseMinutes(booking.start_time);
  const endMinutes = parseMinutes(booking.end_time);

  return weekDays.flatMap((day, dayIndex) => {
    const dayKey = toDateKey(day);
    if (dayKey < startKey || dayKey > endKey) return [];

    const isFirst = dayKey === startKey;
    const isLast = dayKey === endKey;
    let from = startMinutes ?? START_HOUR * 60;
    let to = endMinutes ?? from + 60;

    if (isManyDays) {
      if (!isFirst) from = START_HOUR * 60;
      if (!isLast) to = END_HOUR * 60;
      if (isFirst && (startMinutes == null || startMinutes <= 0)) from = START_HOUR * 60;
      if (isLast && (endMinutes == null || endMinutes >= 24 * 60)) to = END_HOUR * 60;
    }

    if (to <= from) to = from + 60;

    const visibleStart = Math.max(from, START_HOUR * 60);
    const visibleEnd = Math.min(to, END_HOUR * 60);
    if (visibleEnd <= visibleStart) return [];

    return [
      {
        id: `${booking.id}-${dayKey}`,
        bookingId: booking.id,
        name: booking.pet_owner_name || "Pet Owner",
        status: booking.status,
        dayIndex,
        startMinutes: visibleStart,
        endMinutes: visibleEnd,
      },
    ];
  });
}

export default function CalendarPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [search, setSearch] = useState("");
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const todayKey = toDateKey(new Date());

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/sitters/bookings`, {
          params: { status: "all", search, page: 1, limit: 200 },
        });
        if (!cancelled) setBookings(response.data.data ?? []);
      } catch {
        if (!cancelled) setBookings([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [search]);

  const events = useMemo(
    () =>
      bookings
        .filter((booking) => isVisibleStatus(booking.status))
        .flatMap((booking) => bookingSegments(booking, weekDays)),
    [bookings, weekDays],
  );

  const hours = Array.from({ length: HOUR_COUNT }, (_, index) => START_HOUR + index);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-h3 font-bold text-gray-900">Calendar</h1>
        <label className="relative block w-60">
          <input
            className="input pr-10"
            type="search"
            name="search"
            placeholder="Search..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Icon
            src="/icon/search.svg"
            className="pointer-events-none absolute top-1/2 right-3 h-6 w-6 -translate-y-1/2 text-gray-300"
          />
        </label>
      </header>

      <div className="overflow-hidden rounded-2xl bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="btn btn-secondary min-h-10 px-6"
              onClick={() => setWeekStart(startOfWeek(new Date()))}
            >
              Today
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="flex size-8 cursor-pointer items-center justify-center text-gray-300 hover:text-orange-500"
                onClick={() => setWeekStart((current) => addDays(current, -7))}
                aria-label="Previous week"
              >
                <Icon src="/icon/chevron-left.svg" className="h-5 w-5" />
              </button>
              <p className="min-w-44 text-center text-body-2 font-bold text-gray-500">
                {formatWeekRange(weekStart)}
              </p>
              <button
                type="button"
                className="flex size-8 cursor-pointer items-center justify-center text-gray-300 hover:text-orange-500"
                onClick={() => setWeekStart((current) => addDays(current, 7))}
                aria-label="Next week"
              >
                <Icon src="/icon/chevron-right.svg" className="h-5 w-5" />
              </button>
            </div>
          </div>

          <ul className="flex flex-wrap items-center gap-5">
            {LEGEND.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-body-3 text-gray-400">
                <span className={`size-4 rounded-[2px] ${item.box}`} aria-hidden="true" />
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-5xl pr-8 pl-3">
              <div className="grid grid-cols-[4.5rem_repeat(7,minmax(0,1fr))]">
                <div className="flex justify-center py-3 text-gray-300">
                  <Icon src="/icon/clock.svg" className="h-8 w-8" />
                </div>
                {weekDays.map((day, dayIndex) => {
                  const dayKey = toDateKey(day);
                  const isToday = dayKey === todayKey;
                  const isPast = dayKey < todayKey;
                  return (
                    <div
                      key={dayKey}
                      className={`border-b border-gray-200 py-3 pl-3 ${
                        dayIndex === 0 ? "" : "border-l"
                      } ${isPast ? "bg-gray-100" : "bg-white"}`}
                    >
                      <p className="text-sm font-medium text-gray-400">
                        {WEEKDAYS[day.getDay()]}
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          isToday ? "text-orange-500" : "text-gray-600"
                        }`}
                      >
                        {day.getDate()}
                      </p>
                    </div>
                  );
                })}

                <div
                  className="relative bg-white"
                  style={{ height: HOUR_COUNT * ROW_HEIGHT }}
                >
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="absolute right-3 text-right text-body-3 text-gray-300"
                      style={{ top: (hour - START_HOUR) * ROW_HEIGHT - 8 }}
                    >
                      {formatHourLabel(hour)}
                    </div>
                  ))}
                </div>

                {weekDays.map((day, dayIndex) => {
                  const dayKey = toDateKey(day);
                  const isPast = dayKey < todayKey;
                  return (
                    <div
                      key={`col-${dayKey}`}
                      className={`relative ${
                        dayIndex === 0 ? "" : "border-l border-gray-200"
                      } ${isPast ? "bg-gray-100" : "bg-white"}`}
                      style={{ height: HOUR_COUNT * ROW_HEIGHT }}
                    >
                      {hours.map((hour) => (
                        <div
                          key={`${dayKey}-${hour}`}
                          className="absolute inset-x-0 border-b border-gray-200"
                          style={{
                            top: (hour - START_HOUR) * ROW_HEIGHT,
                            height: ROW_HEIGHT,
                          }}
                        />
                      ))}
                      {events
                        .filter((event) => event.dayIndex === dayIndex)
                        .map((event) => {
                          const top =
                            ((event.startMinutes - START_HOUR * 60) / 60) * ROW_HEIGHT;
                          const height = Math.max(
                            ((event.endMinutes - event.startMinutes) / 60) * ROW_HEIGHT,
                            ROW_HEIGHT,
                          );

                          return (
                            <Link
                              key={event.id}
                              href={`/sitter/booking-list/${event.bookingId}`}
                              className={`absolute inset-x-0 z-10 overflow-hidden px-2 py-1 text-body-3 font-medium ${
                                EVENT_STYLES[event.status]
                              }`}
                              style={{ top, height }}
                            >
                              {event.name}
                            </Link>
                          );
                        })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
