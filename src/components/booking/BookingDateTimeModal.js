"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import {
  bookingRangeOverlapsBooked,
  combineBookingDateTime,
  dateHasBookedSlot,
  dateRangeOverlapsBooked,
  HOURLY_TIMES,
  isAtLeastThreeHoursAhead,
  isTimeInsideBookedSlot,
} from "@/lib/booking";
import {
  BookingCalendar,
  DateField,
  getCalendarDays,
  startOfToday,
  toDateKey,
} from "@/components/booking/BookingCalendarPicker";

function dateHasBookableStart(dateKey, bookedSlots = [], now = new Date()) {
  return HOURLY_TIMES.some((time) => {
    if (!isAtLeastThreeHoursAhead(dateKey, time.value, now)) return false;
    return !isTimeInsideBookedSlot(dateKey, time.value, bookedSlots);
  });
}

function isSameDayBooking(startDate, endDate, isManyDays) {
  if (isManyDays && !endDate) return false;
  return Boolean(startDate) && (!endDate || startDate === endDate);
}

function isStartBeforeEnd(startDate, startTime, endDate, endTime, isManyDays) {
  if (!startTime || !endTime) return true;
  if (!isSameDayBooking(startDate, endDate, isManyDays)) {
    if (!startDate || !endDate) return true;
    const start = combineBookingDateTime(startDate, startTime);
    const end = combineBookingDateTime(endDate, endTime);
    return Boolean(start && end && start.getTime() < end.getTime());
  }
  return startTime < endTime;
}

export function TimeDropdown({ name, value, open, onToggle, onSelect, isOptionDisabled }) {
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
        <div className="absolute top-[calc(100%+4px)] z-30 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-(--shadow-dropdown)">
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

/**
 * Shared date+time picker modal — powers the initial "Book Now" flow
 * (PetSitterDetail) and Booking History's "Change Booking Date" flow,
 * so both stay visually and behaviorally identical.
 */
export default function BookingDateTimeModal({
  startDate,
  endDate,
  startTime,
  endTime,
  bookedSlots = [],
  onChange,
  onClose,
  onContinue,
  initialDateMode = "one",
  title = "Booking",
  description,
  submitLabel = "Continue",
  submitting = false,
  submittingLabel = "Saving...",
  closeDisabled = false,
}) {
  const pickerRef = useRef(null);
  const selected = startDate ? new Date(`${startDate}T00:00:00`) : startOfToday();
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());
  const [openPicker, setOpenPicker] = useState(null);
  const [dateMode, setDateMode] = useState(initialDateMode);
  const isManyDays = dateMode === "many";
  const sameDay = isSameDayBooking(startDate, endDate, isManyDays);

  function isStartOptionDisabled(time) {
    if (startDate && !isAtLeastThreeHoursAhead(startDate, time)) return true;
    if (startDate && isTimeInsideBookedSlot(startDate, time, bookedSlots)) return true;
    if (sameDay && endTime && time >= endTime) return true;
    if (
      startDate &&
      endTime &&
      bookingRangeOverlapsBooked(startDate, endDate || startDate, time, endTime, bookedSlots)
    ) {
      return true;
    }
    return false;
  }

  function isEndOptionDisabled(time) {
    if (sameDay && startTime && time <= startTime) return true;
    if (
      startDate &&
      startTime &&
      bookingRangeOverlapsBooked(startDate, endDate || startDate, startTime, time, bookedSlots)
    ) {
      return true;
    }
    return false;
  }

  useEffect(() => {
    if (isManyDays) return;
    const patch = {};
    if (startTime && isStartOptionDisabled(startTime)) patch.startTime = "";
    if (endTime && isEndOptionDisabled(endTime)) patch.endTime = "";
    if (Object.keys(patch).length) onChange(patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, startTime, endTime, sameDay, bookedSlots, onChange, isManyDays]);

  function handleClose() {
    if (closeDisabled) return;
    onClose();
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key !== "Escape") return;
      if (openPicker) {
        setOpenPicker(null);
        return;
      }
      handleClose();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openPicker, closeDisabled]);

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

    onChange({
      endDate: endDate === startDate ? "" : endDate,
      startTime: "",
      endTime: "",
    });
  }

  function openDatePicker(nextPicker) {
    const key =
      nextPicker === "endDate" ? endDate || startDate : startDate || endDate;
    const base = key ? new Date(`${key}T00:00:00`) : startOfToday();
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    setOpenPicker(openPicker === nextPicker ? null : nextPicker);
  }

  function selectDate(nextDate) {
    const key = toDateKey(nextDate);

    if (!isManyDays) {
      onChange({ startDate: key, endDate: key });
      setOpenPicker(null);
      return;
    }

    if (openPicker === "endDate") {
      onChange({ endDate: key });
      setOpenPicker(null);
      return;
    }

    onChange({
      startDate: key,
      endDate: endDate && endDate > key ? endDate : "",
    });
    setOpenPicker(null);
  }

  const today = startOfToday();
  const calendarDays = getCalendarDays(viewYear, viewMonth);

  function isManyStartUnavailable(key, item) {
    if (item.date < today || dateHasBookedSlot(key, bookedSlots)) return true;
    if (endDate && key < endDate && dateRangeOverlapsBooked(key, endDate, bookedSlots)) {
      return true;
    }
    return false;
  }

  function isManyEndUnavailable(key, item) {
    if (item.date < today || dateHasBookedSlot(key, bookedSlots)) return true;
    if (startDate && key <= startDate) return true;
    if (startDate && dateRangeOverlapsBooked(startDate, key, bookedSlots)) return true;
    return false;
  }

  function isOneDayUnavailable(key, item) {
    return item.date < today || !dateHasBookableStart(key, bookedSlots);
  }

  const canContinue =
    !submitting &&
    (isManyDays
      ? Boolean(
          startDate &&
            endDate &&
            endDate > startDate &&
            !dateRangeOverlapsBooked(startDate, endDate, bookedSlots),
        )
      : Boolean(
          startDate &&
            startTime &&
            endTime &&
            !isStartOptionDisabled(startTime) &&
            !isEndOptionDisabled(endTime) &&
            isStartBeforeEnd(startDate, startTime, endDate || startDate, endTime, false) &&
            !bookingRangeOverlapsBooked(
              startDate,
              endDate || startDate,
              startTime,
              endTime,
              bookedSlots,
            ),
        ));

  function handleSubmit(event) {
    event.preventDefault();
    if (!canContinue) return;
    onContinue(event);
  }

  const calendarProps = {
    viewYear,
    viewMonth,
    calendarDays,
    onShiftMonth: shiftMonth,
    isDateUnavailable:
      openPicker === "endDate"
        ? isManyEndUnavailable
        : openPicker === "startDate"
          ? isManyStartUnavailable
          : isOneDayUnavailable,
    isHighlighted: (key) => key === startDate || key === endDate,
    isInRange: (key) =>
      Boolean(
        startDate &&
          endDate &&
          startDate !== endDate &&
          key > startDate &&
          key < endDate,
      ),
    onSelect: selectDate,
    hint: isManyDays
      ? openPicker === "endDate"
        ? "Select an end date"
        : "Select a start date"
      : "",
  };

  const introText =
    typeof description === "function"
      ? description(isManyDays)
      : (description ??
        (isManyDays
          ? "Select a start date and an end date for the service."
          : "Select date and time you want to schedule the service."));

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center overflow-x-hidden bg-black/60 p-4"
      onClick={handleClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-datetime-title"
        className="w-full max-w-xl overflow-visible rounded-2xl bg-white shadow-(--shadow-card)"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 id="booking-datetime-title" className="text-h4 text-gray-900">
            {title}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            disabled={closeDisabled}
            className="cursor-pointer rounded-lg p-1 text-gray-400 transition-colors hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <Icon src="/icon/x.svg" className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-6 py-6">
          <p className="text-body-2 text-gray-500">{introText}</p>

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
            <div className="flex items-center gap-4">
              <Icon src="/icon/calendar.svg" className="h-6 w-6 shrink-0 text-gray-400" />
              {isManyDays ? (
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                  <DateField
                    value={startDate}
                    placeholder="Start date"
                    open={openPicker === "startDate"}
                    onToggle={() => openDatePicker("startDate")}
                  >
                    {openPicker === "startDate" ? (
                      <BookingCalendar {...calendarProps} />
                    ) : null}
                  </DateField>
                  <span className="hidden text-body-2 text-gray-400 sm:inline">-</span>
                  <DateField
                    value={endDate}
                    placeholder="End date"
                    open={openPicker === "endDate"}
                    onToggle={() => openDatePicker("endDate")}
                  >
                    {openPicker === "endDate" ? (
                      <BookingCalendar {...calendarProps} align="end" />
                    ) : null}
                  </DateField>
                </div>
              ) : (
                <DateField
                  value={startDate}
                  placeholder="Select date"
                  open={openPicker === "date"}
                  onToggle={() => openDatePicker("date")}
                >
                  {openPicker === "date" ? <BookingCalendar {...calendarProps} /> : null}
                </DateField>
              )}
            </div>

            {!isManyDays ? (
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
                  Book at least 3 hours in advance. Grayed-out times are already booked.
                </p>
              </div>
            ) : (
              <p className="text-body-3 text-gray-400">
                Grayed-out dates are in the past or already booked.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!canContinue}
            className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? submittingLabel : submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
