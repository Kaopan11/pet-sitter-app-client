"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Icon from "./Icon";
import Pagination from "./Pagination";
import { createConversation, getSitter, getSitterReviews } from "@/lib/api";
import { getToken, getUser } from "@/lib/auth";

const PET_BADGE = {
  dog: "badge-dog",
  cat: "badge-cat",
  bird: "badge-bird",
  rabbit: "badge-rabbit",
};

function isRemoteSrc(src) {
  return String(src ?? "").startsWith("http");
}

function firstString(...values) {
  return values.find((value) => typeof value === "string" && value.trim()) ?? "";
}

function formatExperience(value) {
  if (value == null || value === "") return "";
  const text = String(value).trim();
  if (text === "0") return "";
  if (/exp\.?$/i.test(text)) return text;
  if (/years?$/i.test(text)) return `${text} Exp.`;
  return `${text} Years Exp.`;
}

function normalizePetTypes(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const name = typeof item === "string" ? item : item?.name;
      return String(name ?? "").trim().toLowerCase();
    })
    .filter(Boolean);
}

function collectPhotos(raw) {
  const rows = raw.sitter_photos ?? raw.sitters_photo ?? raw.photos ?? [];
  const list = Array.isArray(rows) ? rows : [];

  return list
    .slice()
    .sort((a, b) => {
      if (typeof a === "string" || typeof b === "string") return 0;
      return (a.sort_order ?? a.sortOrder ?? 0) - (b.sort_order ?? b.sortOrder ?? 0);
    })
    .map((item) =>
      typeof item === "string" ? item : item?.photo_url || item?.photoUrl || ""
    )
    .filter(Boolean);
}

function normalizeSitter(raw) {
  const district = firstString(raw.district, raw.sub_district, raw.subDistrict);
  const province = firstString(raw.province);
  const location =
    firstString(raw.location) || [district, province].filter(Boolean).join(", ");

  return {
    id: raw.id ?? raw.user_id,
    title: firstString(raw.title, raw.display_name, raw.tradeName, "Pet Sitter"),
    sitterName: firstString(raw.sitterName, raw.sitter_name, raw.name),
    avatarUrl: firstString(raw.avatarUrl, raw.avatar_url),
    location,
    rating: Number(raw.rating ?? raw.rating_avg ?? 0) || 0,
    ratingAvg: Number(raw.rating_avg ?? raw.ratingAvg ?? raw.rating ?? 0) || 0,
    reviewCount: Number(raw.review_count ?? raw.reviewCount ?? 0) || 0,
    petTypes: normalizePetTypes(raw.petTypes ?? raw.pet_types),
    photos: collectPhotos(raw),
    introduction: firstString(raw.introduction),
    services: firstString(raw.services),
    myPlace: firstString(raw.myPlace, raw.my_place),
    experience: formatExperience(raw.experience ?? raw.experience_years ?? raw.experienceYears),
    latitude: raw.latitude,
    longitude: raw.longitude,
  };
}

function mapQuery(sitter) {
  if (sitter.latitude != null && sitter.longitude != null && sitter.latitude !== "") {
    return `${sitter.latitude},${sitter.longitude}`;
  }
  return sitter.location || "Bangkok";
}

function Stars({ count }) {
  return (
    <div className="flex items-center gap-0.5 text-green" aria-label={`${count} star rating`}>
      {Array.from({ length: Math.min(5, Math.max(0, count)) }).map((_, index) => (
        <Icon key={index} src="/icon/star.svg" className="h-5 w-5" />
      ))}
    </div>
  );
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
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

const HOURLY_TIMES = Array.from({ length: 24 }, (_, hour) => {
  const value = `${String(hour).padStart(2, "0")}:00`;
  const hour12 = hour % 12 || 12;
  const suffix = hour < 12 ? "AM" : "PM";
  return { value, label: `${hour12}:00 ${suffix}` };
});

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function formatBookingDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)}, ${date.getFullYear()}`;
}

function formatBookingRange(startDate, endDate) {
  if (!startDate) return "";
  if (!endDate || endDate === startDate) return formatBookingDate(startDate);
  return `${formatBookingDate(startDate)} - ${formatBookingDate(endDate)}`;
}

function getCalendarDays(year, month) {
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

const MIN_BOOKING_ADVANCE_MS = 3 * 60 * 60 * 1000;

function combineDateTime(dateKey, timeValue) {
  if (!dateKey || !timeValue) return null;
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute] = String(timeValue).split(":").map(Number);
  if ([year, month, day, hour].some((part) => Number.isNaN(part))) return null;
  return new Date(year, month - 1, day, hour, minute || 0, 0, 0);
}

function isAtLeastThreeHoursAhead(dateKey, timeValue, now = new Date()) {
  const start = combineDateTime(dateKey, timeValue);
  return Boolean(start && start.getTime() >= now.getTime() + MIN_BOOKING_ADVANCE_MS);
}

function dateHasBookableStart(dateKey, now = new Date()) {
  return HOURLY_TIMES.some((time) => isAtLeastThreeHoursAhead(dateKey, time.value, now));
}

function isSameDayBooking(startDate, endDate, isManyDays) {
  if (isManyDays && !endDate) return false;
  return Boolean(startDate) && (!endDate || startDate === endDate);
}

function isStartBeforeEnd(startDate, startTime, endDate, endTime, isManyDays) {
  if (!startTime || !endTime) return true;
  if (!isSameDayBooking(startDate, endDate, isManyDays)) {
    if (!startDate || !endDate) return true;
    const start = combineDateTime(startDate, startTime);
    const end = combineDateTime(endDate, endTime);
    return Boolean(start && end && start.getTime() < end.getTime());
  }
  return startTime < endTime;
}

function TimeDropdown({ name, value, open, onToggle, onSelect, isOptionDisabled }) {
  const selected = HOURLY_TIMES.find((time) => time.value === value);

  return (
    <div className="relative min-w-0 flex-1">
      <button
        type="button"
        onClick={onToggle}
        className={`input w-full cursor-pointer text-left ${
          selected ? "text-black" : "text-gray-400"
        }`}
      >
        {selected?.label ?? "Select time"}
      </button>
      {open ? (
        <div className="absolute top-[calc(100%+4px)] z-30 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-[var(--shadow-dropdown)]">
          {HOURLY_TIMES.map((time) => {
            const disabled = Boolean(isOptionDisabled?.(time.value));
            return (
              <button
                key={time.value}
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (disabled) return;
                  onSelect(name, time.value);
                }}
                className={`w-full px-3 py-2 text-left text-body-2 ${
                  disabled
                    ? "cursor-not-allowed text-gray-300"
                    : time.value === value
                      ? "cursor-pointer bg-gray-100 text-black"
                      : "cursor-pointer text-black hover:bg-gray-100"
                }`}
              >
                {time.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function LoginRequiredModal({ onClose, onLogin }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-required-title"
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 id="login-required-title" className="text-h4 text-gray-900">
            Please log in
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Close"
          >
            <Icon src="/icon/x.svg" className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-6">
          <p className="text-body-2 text-gray-500">
            You need to log in first to continue.
          </p>
        </div>
        <div className="flex items-center gap-3 px-6 pb-6">
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
            Cancel
          </button>
          <button type="button" onClick={onLogin} className="btn btn-primary flex-1">
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingModal({
  startDate,
  endDate,
  startTime,
  endTime,
  onChange,
  onClose,
  onContinue,
}) {
  const pickerRef = useRef(null);
  const selected = startDate ? new Date(`${startDate}T00:00:00`) : startOfToday();
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());
  const [openPicker, setOpenPicker] = useState(null);
  const [dateMode, setDateMode] = useState("one");
  const isManyDays = dateMode === "many";
  const sameDay = isSameDayBooking(startDate, endDate, isManyDays);

  function isStartOptionDisabled(time) {
    if (startDate && !isAtLeastThreeHoursAhead(startDate, time)) return true;
    if (sameDay && endTime && time >= endTime) return true;
    return false;
  }

  function isEndOptionDisabled(time) {
    if (sameDay && startTime && time <= startTime) return true;
    return false;
  }

  useEffect(() => {
    const patch = {};
    if (startTime && isStartOptionDisabled(startTime)) patch.startTime = "";
    if (endTime && isEndOptionDisabled(endTime)) patch.endTime = "";
    if (Object.keys(patch).length) onChange(patch);
  }, [startDate, endDate, startTime, endTime, sameDay]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key !== "Escape") return;
      if (openPicker) {
        setOpenPicker(null);
        return;
      }
      onClose();
    }

    function handlePointerDown(event) {
      if (!pickerRef.current?.contains(event.target)) {
        setOpenPicker(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [onClose, openPicker]);

  function shiftMonth(step) {
    const next = new Date(viewYear, viewMonth + step, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  function switchDateMode(nextMode) {
    setDateMode(nextMode);
    setOpenPicker(null);

    if (nextMode === "one") {
      onChange({ endDate: startDate || "" });
      return;
    }

    if (endDate === startDate) {
      onChange({ endDate: "" });
    }
  }

  function selectDate(nextDate) {
    const key = toDateKey(nextDate);

    if (!isManyDays) {
      onChange({ startDate: key, endDate: key });
      setOpenPicker(null);
      return;
    }

    if (!startDate || (startDate && endDate)) {
      onChange({ startDate: key, endDate: "" });
      return;
    }

    if (key < startDate) {
      onChange({ startDate: key, endDate: startDate });
    } else {
      onChange({ endDate: key });
    }
    setOpenPicker(null);
  }

  const today = startOfToday();
  const calendarDays = getCalendarDays(viewYear, viewMonth);
  const canContinue = Boolean(
    startDate &&
      startTime &&
      endTime &&
      (!isManyDays || endDate) &&
      !isStartOptionDisabled(startTime) &&
      !isEndOptionDisabled(endTime) &&
      isStartBeforeEnd(startDate, startTime, endDate || startDate, endTime, isManyDays)
  );

  function handleSubmit(event) {
    event.preventDefault();
    if (!canContinue) return;
    onContinue(event);
  }

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="w-full max-w-xl overflow-visible rounded-2xl bg-white shadow-(--shadow-card)"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 id="booking-title" className="text-h4 text-gray-900">
            Booking
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Close"
          >
            <Icon src="/icon/x.svg" className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-6 py-6">
          <p className="text-body-2 text-gray-500">
            {isManyDays
              ? "Select dates and time you want to schedule the service."
              : "Select date and time you want to schedule the service."}
          </p>

          <div
            className="flex w-full rounded-full bg-gray-100 p-1"
            role="tablist"
            aria-label="Booking duration"
          >
            <button
              type="button"
              role="tab"
              aria-selected={!isManyDays}
              className={`min-h-11 flex-1 cursor-pointer rounded-full py-2 text-body-3 font-bold transition ${
                !isManyDays
                  ? "bg-white text-orange-500 ring-1 ring-orange-500"
                  : "text-gray-400"
              }`}
              onClick={() => switchDateMode("one")}
            >
              One day
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isManyDays}
              className={`min-h-11 flex-1 cursor-pointer rounded-full py-2 text-body-3 font-bold transition ${
                isManyDays
                  ? "bg-white text-orange-500 ring-1 ring-orange-500"
                  : "text-gray-400"
              }`}
              onClick={() => switchDateMode("many")}
            >
              Many days
            </button>
          </div>

          <div ref={pickerRef} className="flex flex-col gap-6">
            <div className="relative flex items-center gap-4">
              <Icon src="/icon/calendar.svg" className="h-6 w-6 text-gray-400" />
              <button
                type="button"
                onClick={() => setOpenPicker(openPicker === "date" ? null : "date")}
                className={`input w-full cursor-pointer text-left ${
                  startDate ? "text-black" : "text-gray-400"
                }`}
              >
                {(isManyDays
                  ? formatBookingRange(startDate, endDate)
                  : formatBookingDate(startDate)) || "Select date"}
              </button>
              {openPicker === "date" ? (
                <div className="absolute top-[calc(100%+8px)] left-10 z-30 w-[min(100%,20rem)] rounded-xl bg-white p-4 shadow-(--shadow-dropdown)">
                  <div className="mb-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => shiftMonth(-1)}
                      className="flex size-8 cursor-pointer items-center justify-center text-gray-400 hover:text-orange-500"
                      aria-label="Previous month"
                    >
                      <Icon src="/icon/chevron-left.svg" className="h-4 w-4" />
                    </button>
                    <p className="text-body-2 font-bold text-black">
                      {MONTHS[viewMonth]} {viewYear}
                    </p>
                    <button
                      type="button"
                      onClick={() => shiftMonth(1)}
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
                      const isUnavailable =
                        item.date < today || !dateHasBookableStart(key);
                      const isStart = key === startDate;
                      const isEnd = isManyDays && Boolean(endDate) && key === endDate;
                      const inRange =
                        isManyDays &&
                        Boolean(startDate && endDate && startDate !== endDate) &&
                        key > startDate &&
                        key < endDate;

                      return (
                        <button
                          key={item.key}
                          type="button"
                          disabled={isUnavailable}
                          onClick={() => selectDate(item.date)}
                          className={`mx-auto flex size-9 items-center justify-center rounded-full text-body-3 ${
                            isStart || isEnd
                              ? "bg-orange-500 font-bold text-white"
                              : inRange
                                ? "bg-orange-100 font-medium text-orange-500"
                                : isUnavailable
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
                  {isManyDays ? (
                    <p className="mt-3 text-center text-body-3 text-gray-400">
                      {startDate && !endDate
                        ? "Select an end date"
                        : "Select a start and end date"}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <Icon src="/icon/clock.svg" className="h-6 w-6 text-gray-400" />
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <TimeDropdown
                    name="startTime"
                    value={startTime}
                    open={openPicker === "startTime"}
                    isOptionDisabled={isStartOptionDisabled}
                    onToggle={() =>
                      setOpenPicker(openPicker === "startTime" ? null : "startTime")
                    }
                    onSelect={(name, value) => {
                      onChange({ [name]: value });
                      setOpenPicker(null);
                    }}
                  />
                  <span className="text-body-2 text-gray-400">-</span>
                  <TimeDropdown
                    name="endTime"
                    value={endTime}
                    open={openPicker === "endTime"}
                    isOptionDisabled={isEndOptionDisabled}
                    onToggle={() =>
                      setOpenPicker(openPicker === "endTime" ? null : "endTime")
                    }
                    onSelect={(name, value) => {
                      onChange({ [name]: value });
                      setOpenPicker(null);
                    }}
                  />
                </div>
              </div>
              <p className="pl-10 text-body-3 text-gray-400">
                Book at least 3 hours in advance. Start time must be before end time.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canContinue}
            className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

function Gallery({ photos, title }) {
  const total = photos.length;
  const [isLg, setIsLg] = useState(false);
  const [offset, setOffset] = useState(photos.length > 1 ? 1 : 0);
  const [animated, setAnimated] = useState(true);
  const locked = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsLg(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const visibleCount = isLg ? Math.min(3, Math.max(total, 1)) : 1;
  const cloneCount = total > 1 ? visibleCount : 0;
  const start = cloneCount;
  const slides =
    total > 1
      ? [...photos.slice(-cloneCount), ...photos, ...photos.slice(0, cloneCount)]
      : photos;

  useEffect(() => {
    setAnimated(false);
    setOffset(start);
    locked.current = false;
  }, [start]);

  if (total === 0) {
    return (
      <div className="w-full bg-[#FAFAFB] pt-6 sm:pt-8">
        <div className="h-80 w-full lg:h-[28rem]" />
      </div>
    );
  }

  const go = (step) => {
    if (total <= 1 || locked.current) return;
    locked.current = true;
    setAnimated(true);
    setOffset((value) => value + step);
  };

  const handleTransitionEnd = (event) => {
    if (event.target !== event.currentTarget) return;
    if (total <= 1) {
      locked.current = false;
      return;
    }
    if (offset >= start + total) {
      setAnimated(false);
      setOffset(start);
    } else if (offset < start) {
      setAnimated(false);
      setOffset(start + total - 1);
    }
    locked.current = false;
  };

  return (
    <div className="relative w-full bg-[#FAFAFB] pt-6 sm:pt-8">
      <div className="relative overflow-hidden">
        <div
          className={`flex ${animated ? "transition-transform duration-500 ease-out" : ""}`}
          style={{
            width: `${(slides.length / visibleCount) * 100}%`,
            transform: `translateX(-${(offset / slides.length) * 100}%)`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((src, slideIndex) => (
            <div
              key={`${src}-${slideIndex}`}
              className="relative h-80 shrink-0 px-1 lg:h-[28rem]"
              style={{ width: `${100 / slides.length}%` }}
            >
              <div className="relative h-full overflow-hidden">
                <Image
                  src={src}
                  alt={`${title} photo ${slideIndex + 1}`}
                  fill
                  sizes={isLg ? "33vw" : "100vw"}
                  className="object-cover object-[50%_30%]"
                  priority={slideIndex < visibleCount + start}
                  unoptimized={isRemoteSrc(src)}
                />
              </div>
            </div>
          ))}
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute top-1/2 left-4 z-10 flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-gray-400 shadow-[var(--shadow-card)] transition-colors hover:text-orange-500 lg:left-6"
              aria-label="Previous photo"
            >
              <Icon src="/icon/chevron-left.svg" className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute top-1/2 right-4 z-10 flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-gray-400 shadow-[var(--shadow-card)] transition-colors hover:text-orange-500 lg:right-6"
              aria-label="Next photo"
            >
              <Icon src="/icon/chevron-right.svg" className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const REVIEW_PAGE_SIZE = 5;
const RATING_FILTERS = [5, 4, 3, 2, 1];

function formatReviewDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`;
}

function normalizeReview(raw) {
  const rating = Number(raw.rating ?? raw.stars ?? 0) || 0;

  return {
    id: raw.id ?? raw.review_id ?? `${raw.created_at ?? ""}-${raw.name ?? ""}`,
    name: firstString(
      raw.name,
      raw.owner_name,
      raw.ownerName,
      raw.user_name,
      raw.reviewer_name,
      raw.reviewerName,
      "Pet Owner"
    ),
    avatarUrl: firstString(
      raw.avatarUrl,
      raw.avatar_url,
      raw.owner_avatar,
      raw.ownerAvatar
    ),
    date: formatReviewDate(raw.created_at ?? raw.createdAt ?? raw.date),
    rating: Math.min(5, Math.max(0, Math.round(rating))),
    comment: firstString(raw.comment, raw.content, raw.review, raw.text),
  };
}

function FilterStars({ count }) {
  return (
    <span className="flex items-center gap-0.5 text-green">
      {Array.from({ length: count }).map((_, index) => (
        <Icon key={index} src="/icon/star.svg" className="h-4.5 w-4.5" />
      ))}
    </span>
  );
}

function ReviewsSection({ sitterId, ratingAvg, reviewCount }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [summary, setSummary] = useState({
    ratingAvg: Number(ratingAvg) || 0,
    reviewCount: Number(reviewCount) || 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await getSitterReviews(sitterId, {
          page,
          limit: REVIEW_PAGE_SIZE,
          rating: ratingFilter,
        });
        if (cancelled) return;
        setReviews(result.data.map(normalizeReview));
        setTotalPages(result.pagination.totalPages ?? 0);
        setSummary({
          ratingAvg:
            Number(result.summary?.rating_avg ?? result.summary?.ratingAvg ?? ratingAvg) || 0,
          reviewCount:
            Number(result.summary?.review_count ?? result.summary?.reviewCount ?? reviewCount) ||
            0,
        });
      } catch {
        if (!cancelled) {
          setReviews([]);
          setTotalPages(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sitterId, page, ratingFilter, ratingAvg, reviewCount]);

  const average = summary.ratingAvg;
  const count = summary.reviewCount;

  function handleFilter(next) {
    setRatingFilter(next);
    setPage(1);
  }

  return (
    <section className="rounded-2xl rounded-tl-[100px] bg-gray-100 p-4">
      <div className="rounded-xl rounded-l-[120px] bg-white p-5">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
          <div className="relative size-36.5 shrink-0">
            <Image
              src="/image/rating.svg"
              alt=""
              width={146}
              height={146}
              className="size-36.5"
              unoptimized
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pb-2 text-white">
              <span className="text-h3 leading-none">{Number(average).toFixed(1)}</span>
              <span className="mt-1 text-body-3">
                {count} {count === 1 ? "Review" : "Reviews"}
              </span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-h3 text-black">Rating & Reviews</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleFilter(null)}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-body-3 font-medium transition-colors ${
                  ratingFilter == null
                    ? "border-orange-500 text-orange-500"
                    : "border-gray-200 text-gray-500 hover:border-orange-500 hover:text-orange-500"
                }`}
              >
                All Reviews
              </button>
              {RATING_FILTERS.map((rating) => {
                const isSelected = ratingFilter === rating;
                return (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleFilter(isSelected ? null : rating)}
                    className={`group flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1.5 transition-colors ${
                      isSelected
                        ? "border-orange-500 text-orange-500"
                        : "border-gray-200 text-gray-500 hover:border-orange-500 hover:text-orange-500"
                    }`}
                  >
                    <span className="text-body-3 font-medium">{rating}</span>
                    <FilterStars count={rating} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 px-5 py-8 sm:px-8 sm:py-10">
          {loading ? (
            <p className="py-10 text-body-2 text-gray-400">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="py-10 text-body-2 text-gray-400">
              {ratingFilter ? "No reviews for this rating" : "No reviews yet"}
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="flex flex-col gap-4 py-8 first:pt-4 sm:flex-row sm:items-start sm:justify-between sm:gap-10"
                >
                  <div className="flex shrink-0 items-center gap-4 sm:w-56">
                    {review.avatarUrl ? (
                      <Image
                        src={review.avatarUrl}
                        alt={review.name}
                        width={56}
                        height={56}
                        className="avatar size-14 shrink-0"
                        unoptimized={isRemoteSrc(review.avatarUrl)}
                      />
                    ) : (
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-300">
                        <Icon src="/icon/user.svg" className="h-6 w-6" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-body-2 font-bold text-black">{review.name}</p>
                      {review.date ? (
                        <p className="text-body-3 text-gray-400">{review.date}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    {review.rating > 0 ? <Stars count={review.rating} /> : null}
                    {review.comment ? (
                      <p className="mt-2 text-body-2 text-gray-500">{review.comment}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}

        {totalPages > 1 ? (
          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function PetSitterDetail({ sitterId }) {
  const router = useRouter();
  const [sitter, setSitter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [booking, setBooking] = useState({
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    setIsLoggedIn(Boolean(getUser()));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getSitter(sitterId);
        if (!cancelled) setSitter(normalizeSitter(data));
      } catch (err) {
        if (!cancelled) {
          setSitter(null);
          setError(err instanceof Error ? err.message : "Failed to load pet sitter");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sitterId]);

  async function handleSendMessage() {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    if (!sitter?.id || sendingMessage) return;

    setSendingMessage(true);
    try {
      const conversation = await createConversation(sitter.id);
      router.push(`/messages?id=${conversation.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start chat");
    } finally {
      setSendingMessage(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-full bg-[#FAFAFB] px-4 py-16">
        <p className="mx-auto max-w-7xl text-body-2 text-gray-400">Loading pet sitter...</p>
      </div>
    );
  }

  if (error || !sitter) {
    return (
      <div className="min-h-full bg-[#FAFAFB] px-4 py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-4">
          <p className="text-body-2 text-red">{error || "Pet sitter not found"}</p>
          <Link href="/find-sitter" className="btn btn-secondary w-fit">
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  const query = encodeURIComponent(mapQuery(sitter));
  const mapSrc = `https://maps.google.com/maps?q=${query}&z=15&output=embed`;
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${query}`;

  function requireLogin(onAllowed) {
    if (isLoggedIn) {
      onAllowed?.();
      return;
    }
    setLoginModalOpen(true);
  }

  function handleSendMessage() {
    requireLogin();
  }

  function handleBookNow() {
    requireLogin(() => setBookingOpen(true));
  }

  function handleLoginConfirm() {
    setLoginModalOpen(false);
    router.push("/login");
  }

  function handleBookingChange(patch) {
    setBooking((current) => ({ ...current, ...patch }));
  }

  /** Continue → หน้าจอง 3 step พร้อม query ตาม contract ทีม */
  function handleBookingContinue(event) {
    event.preventDefault();
    if (!booking.startDate || !booking.startTime || !booking.endTime) return;
    if (!isAtLeastThreeHoursAhead(booking.startDate, booking.startTime)) return;
    const endDate = booking.endDate || booking.startDate;
    if (!isStartBeforeEnd(booking.startDate, booking.startTime, endDate, booking.endTime, endDate !== booking.startDate)) {
      return;
    }
    if (!booking.endDate) {
      setBooking((current) => ({ ...current, endDate: current.startDate }));
    }
    setBookingOpen(false);
    router.push(`/owner/booking?${params.toString()}`);
  }

  return (
    <div className="min-h-full bg-[#FAFAFB]">
      <Gallery photos={sitter.photos} title={sitter.title} />

      <div className="bg-[#FAFAFB]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_26rem] lg:items-start lg:gap-16 lg:px-8 lg:py-16">
          <div className="flex min-w-0 flex-col gap-10">
          <h1 className="text-h2 text-black">{sitter.title}</h1>

          {sitter.introduction && (
            <section className="flex flex-col gap-3">
              <h2 className="text-h4 text-black">Introduction</h2>
              <p className="whitespace-pre-line text-body-2 text-gray-400">
                {sitter.introduction}
              </p>
            </section>
          )}

          {sitter.services && (
            <section className="flex flex-col gap-3">
              <h2 className="text-h4 text-black">Services</h2>
              <p className="whitespace-pre-line text-body-2 text-gray-400">
                {sitter.services}
              </p>
            </section>
          )}

          {sitter.myPlace && (
            <section className="flex flex-col gap-3">
              <h2 className="text-h4 text-black">My Place</h2>
              <p className="whitespace-pre-line text-body-2 text-gray-400">
                {sitter.myPlace}
              </p>
            </section>
          )}

          {sitter.location && (
            <section className="overflow-hidden rounded-2xl">
              <div className="relative h-72 w-full bg-gray-100">
                <iframe
                  title={`${sitter.title} location`}
                  src={mapSrc}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a
                  href={mapHref}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
                >
                  <span className="flex size-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-(--shadow-dropdown)">
                    <Icon src="/icon/paw.svg" className="h-7 w-7" />
                  </span>
                  <span className="text-body-2 font-bold text-orange-500">See Map</span>
                </a>
              </div>
            </section>
          )}

          <ReviewsSection
            sitterId={sitter.id ?? sitterId}
            ratingAvg={sitter.ratingAvg}
            reviewCount={sitter.reviewCount}
          />
        </div>

        <aside className="z-10 lg:sticky lg:top-28 lg:self-start">
          <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-8 text-center shadow-[var(--shadow-card)]">
            {sitter.avatarUrl ? (
              <Image
                src={sitter.avatarUrl}
                alt={sitter.sitterName || sitter.title}
                width={80}
                height={80}
                className="avatar size-20 shrink-0"
                unoptimized={isRemoteSrc(sitter.avatarUrl)}
              />
            ) : (
              <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-300">
                <Icon src="/icon/user.svg" className="h-9 w-9" />
              </div>
            )}

            <h2 className="mt-4 text-h4 text-black">{sitter.title}</h2>

            {(sitter.sitterName || sitter.experience) && (
              <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                {sitter.sitterName && (
                  <p className="text-body-2 font-bold text-black">{sitter.sitterName}</p>
                )}
                {sitter.experience && (
                  <span className="text-body-3 font-medium text-green">{sitter.experience}</span>
                )}
              </div>
            )}

            {sitter.rating > 0 && (
              <div className="mt-3">
                <Stars count={sitter.rating} />
              </div>
            )}

            {sitter.location && (
              <div className="mt-3 flex items-center justify-center gap-1.5 text-body-3 text-gray-400">
                <Icon src="/icon/map-pin.svg" className="h-4 w-4" />
                <span>{sitter.location}</span>
              </div>
            )}

            {sitter.petTypes.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {sitter.petTypes.map((type) => {
                  const label = type.charAt(0).toUpperCase() + type.slice(1);
                  return (
                    <span key={type} className={`badge ${PET_BADGE[type] ?? ""}`}>
                      {label}
                    </span>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex w-full gap-3 border-t border-gray-200 pt-6">
              {isLoggedIn ? (
                <button
                  type="button"
                  className="btn btn-secondary min-w-0 flex-1 px-3"
                  onClick={handleSendMessage}
                  disabled={sendingMessage}
                >
                  {sendingMessage ? "Opening..." : "Send Message"}
                </button>
              ) : (
                <Link href={loginHref} className="btn btn-secondary min-w-0 flex-1 px-3">
                  Send Message
                </Link>
              )}
              <button
                type="button"
                className="btn btn-primary min-w-0 flex-1 px-3"
                onClick={handleBookNow}
              >
                Book Now
              </button>
            </div>
          </div>
        </aside>
        </div>
      </div>

      {loginModalOpen ? (
        <LoginRequiredModal
          onClose={() => setLoginModalOpen(false)}
          onLogin={handleLoginConfirm}
        />
      ) : null}

      {bookingOpen ? (
        <BookingModal
          startDate={booking.startDate}
          endDate={booking.endDate}
          startTime={booking.startTime}
          endTime={booking.endTime}
          onChange={handleBookingChange}
          onClose={() => setBookingOpen(false)}
          onContinue={handleBookingContinue}
        />
      ) : null}
    </div>
  );
}
