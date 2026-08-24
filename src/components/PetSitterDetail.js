"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Icon from "./Icon";
import { getSitter } from "@/lib/api";
import { getUser } from "@/lib/auth";

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

function TimeDropdown({ name, value, open, onToggle, onSelect }) {
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
          {HOURLY_TIMES.map((time) => (
            <button
              key={time.value}
              type="button"
              onClick={() => onSelect(name, time.value)}
              className={`w-full cursor-pointer px-3 py-2 text-left text-body-2 text-black ${
                time.value === value ? "bg-gray-100" : "hover:bg-gray-100"
              }`}
            >
              {time.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function BookingModal({ date, startTime, endTime, onChange, onClose, onContinue }) {
  const pickerRef = useRef(null);
  const selected = date ? new Date(`${date}T00:00:00`) : startOfToday();
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());
  const [openPicker, setOpenPicker] = useState(null);

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

  function selectDate(nextDate) {
    onChange("date", toDateKey(nextDate));
    setOpenPicker(null);
  }

  const today = startOfToday();
  const calendarDays = getCalendarDays(viewYear, viewMonth);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="w-full max-w-xl overflow-visible rounded-2xl bg-white shadow-[var(--shadow-card)]"
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

        <form onSubmit={onContinue} className="flex flex-col gap-6 px-6 py-6">
          <p className="text-body-2 text-gray-500">
            Select date and time you want to schedule the service.
          </p>

          <div ref={pickerRef} className="flex flex-col gap-6">
            <div className="relative flex items-center gap-4">
              <Icon src="/icon/calendar.svg" className="h-6 w-6 text-gray-400" />
              <button
                type="button"
                onClick={() => setOpenPicker(openPicker === "date" ? null : "date")}
                className={`input w-full cursor-pointer text-left ${
                  date ? "text-black" : "text-gray-400"
                }`}
              >
                {formatBookingDate(date) || "Select date"}
              </button>
              {openPicker === "date" ? (
                <div className="absolute top-[calc(100%+8px)] left-10 z-30 w-[min(100%,20rem)] rounded-xl bg-white p-4 shadow-[var(--shadow-dropdown)]">
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
                      const isPast = item.date < today;
                      const isSelected = date === key;

                      return (
                        <button
                          key={item.key}
                          type="button"
                          disabled={isPast}
                          onClick={() => selectDate(item.date)}
                          className={`mx-auto flex size-9 items-center justify-center rounded-full text-body-3 ${
                            isSelected
                              ? "bg-orange-500 font-bold text-white"
                              : isPast
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
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-4">
              <Icon src="/icon/clock.svg" className="h-6 w-6 text-gray-400" />
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <TimeDropdown
                  name="startTime"
                  value={startTime}
                  open={openPicker === "startTime"}
                  onToggle={() =>
                    setOpenPicker(openPicker === "startTime" ? null : "startTime")
                  }
                  onSelect={(name, value) => {
                    onChange(name, value);
                    setOpenPicker(null);
                  }}
                />
                <span className="text-body-2 text-gray-400">-</span>
                <TimeDropdown
                  name="endTime"
                  value={endTime}
                  open={openPicker === "endTime"}
                  onToggle={() =>
                    setOpenPicker(openPicker === "endTime" ? null : "endTime")
                  }
                  onSelect={(name, value) => {
                    onChange(name, value);
                    setOpenPicker(null);
                  }}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

function Gallery({ photos, title }) {
  const [index, setIndex] = useState(0);
  const total = photos.length;

  if (total === 0) {
    return <div className="h-64 w-full bg-gray-100 lg:h-80" />;
  }

  const go = (step) => {
    setIndex((current) => (current + step + total) % total);
  };

  const desktopPhotos =
    total <= 3
      ? photos
      : [0, 1, 2].map((offset) => photos[(index + offset) % total]);

  return (
    <div className="relative w-full overflow-hidden bg-white px-4 pt-6 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div className="relative lg:hidden">
          <div className="relative h-64 w-full overflow-hidden rounded-2xl">
            <Image
              src={photos[index]}
              alt={title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
              unoptimized={isRemoteSrc(photos[index])}
            />
          </div>
        </div>

        <div className="hidden gap-6 lg:grid lg:grid-cols-3">
          {desktopPhotos.map((src, photoIndex) => (
            <div key={`${src}-${photoIndex}`} className="relative h-80 overflow-hidden rounded-2xl">
              <Image
                src={src}
                alt={`${title} photo ${photoIndex + 1}`}
                fill
                sizes="33vw"
                className="object-cover"
                priority={photoIndex === 0}
                unoptimized={isRemoteSrc(src)}
              />
            </div>
          ))}
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute top-1/2 left-0 z-10 flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-gray-400 shadow-[var(--shadow-card)] transition-colors hover:text-orange-500 lg:-left-2"
              aria-label="Previous photo"
            >
              <Icon src="/icon/chevron-left.svg" className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute top-1/2 right-0 z-10 flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-gray-400 shadow-[var(--shadow-card)] transition-colors hover:text-orange-500 lg:-right-2"
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

export default function PetSitterDetail({ sitterId }) {
  const [sitter, setSitter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [booking, setBooking] = useState({
    date: "",
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

  if (loading) {
    return (
      <div className="min-h-full bg-white px-4 py-16">
        <p className="mx-auto max-w-7xl text-body-2 text-gray-400">Loading pet sitter...</p>
      </div>
    );
  }

  if (error || !sitter) {
    return (
      <div className="min-h-full bg-white px-4 py-16">
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
  const loginHref = "/login";

  function handleBookingChange(name, value) {
    setBooking((current) => ({ ...current, [name]: value }));
  }

  function handleBookingContinue(event) {
    event.preventDefault();
    if (!booking.date || !booking.startTime || !booking.endTime) return;
    setBookingOpen(false);
  }

  return (
    <div className="min-h-full bg-white pb-16">
      <Gallery photos={sitter.photos} title={sitter.title} />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 pt-10 sm:px-6 lg:grid-cols-[1fr_26rem] lg:items-start lg:gap-16 lg:px-8">
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
                  <span className="flex size-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-[var(--shadow-dropdown)]">
                    <Icon src="/icon/paw.svg" className="h-7 w-7" />
                  </span>
                  <span className="text-body-2 font-bold text-orange-500">See Map</span>
                </a>
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-28">
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
                <button type="button" className="btn btn-secondary min-w-0 flex-1 px-3">
                  Send Message
                </button>
              ) : (
                <Link href={loginHref} className="btn btn-secondary min-w-0 flex-1 px-3">
                  Send Message
                </Link>
              )}
              <button
                type="button"
                className="btn btn-primary min-w-0 flex-1 px-3"
                onClick={() => setBookingOpen(true)}
              >
                Book Now
              </button>
            </div>
          </div>
        </aside>
      </div>

      {bookingOpen ? (
        <BookingModal
          date={booking.date}
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
