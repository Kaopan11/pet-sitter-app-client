"use client";

/**
 * หน้า Thank You หลังจองสำเร็จ
 * transactionNo / total จากผล POST /api/bookings เมื่อมี
 */

import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/Icon";
import {
  calculateBookingPreviewTotal,
  formatBookingDate,
  formatTimeRange,
} from "@/lib/booking";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatTransactionDate(date = new Date()) {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function DetailBlock({ label, children }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <dt className="text-body-3 font-medium text-gray-400">{label}:</dt>
      <dd className="text-body-1 font-bold wrap-break-word text-gray-900">
        {children}
      </dd>
    </div>
  );
}

export default function ThankYouView({
  sitter,
  startDate,
  endDate,
  startTime,
  endTime,
  hours,
  isManyDays = false,
  nights = null,
  selectedPets,
  transactionNo = "",
  totalPrice,
}) {
  const previewTotal = calculateBookingPreviewTotal({
    isManyDays,
    hours,
    nights,
    petCount: selectedPets.length,
  });
  const parsedTotal = Number(totalPrice);
  const total = Number.isFinite(parsedTotal) ? parsedTotal : previewTotal;
  const petNames =
    selectedPets.length === 0
      ? "-"
      : selectedPets.map((pet) => pet.name).join(", ");

  const dateLabel = isManyDays
    ? `${formatBookingDate(startDate)} - ${formatBookingDate(endDate)}`
    : formatBookingDate(startDate);

  const durationLabel = isManyDays
    ? `${nights} night${nights !== 1 ? "s" : ""}`
    : `${hours} hour${hours !== 1 ? "s" : ""}`;

  return (
    <div
      className="relative overflow-x-hidden px-4 py-8 sm:px-8 sm:py-16"
      style={{ minHeight: "calc(100vh - 5rem)" }}
    >
      {/* Desktop decorations */}
      <Image
        src="/image/cloud-pink-arc-green.svg"
        alt=""
        width={288}
        height={337}
        className="pointer-events-none absolute -top-6 -left-10 z-0 hidden w-50 lg:block xl:w-65"
        aria-hidden
        priority
      />
      <Image
        src="/image/cat-arc-yellow.svg"
        alt=""
        width={311}
        height={465}
        className="pointer-events-none absolute right-0 bottom-0 z-0 hidden w-55 lg:block xl:w-70"
        aria-hidden
        priority
      />
      <Image
        src="/image/pill-blue.svg"
        alt=""
        width={80}
        height={80}
        className="pointer-events-none absolute right-28 bottom-52 z-0 hidden lg:block xl:right-40 xl:bottom-64"
        aria-hidden
      />

      {/* Mobile decorations — โค้งเขียว + อุ้งเท้า ตาม Figma */}
      <Image
        src="/image/circle-green.svg"
        alt=""
        width={200}
        height={200}
        className="pointer-events-none absolute -bottom-8 -left-16 z-0 w-48 opacity-80 md:hidden"
        aria-hidden
      />
      <Image
        src="/image/paw-pink.svg"
        alt=""
        width={96}
        height={96}
        className="pointer-events-none absolute bottom-28 left-1/2 z-0 w-20 -translate-x-1/2 opacity-90 md:hidden"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-160">
        <div className="overflow-hidden rounded-2xl bg-white shadow-(--shadow-card)">
          <div className="bg-black px-5 py-10 text-center text-white sm:px-12 sm:py-14">
            <h1 className="text-h3 font-bold tracking-tight wrap-break-word text-white sm:text-h2 sm:text-[2rem] sm:leading-10">
              Thank You For Booking
            </h1>
            <p className="mt-3 text-body-2 font-medium text-white/90">
              We will send your booking information to Pet Sitter.
            </p>
          </div>

          <div className="px-5 py-6 sm:px-10 sm:py-10">
            <div className="space-y-1 text-body-3 font-medium wrap-break-word text-gray-400">
              <p>Transaction Date: {formatTransactionDate()}</p>
              <p>Transaction No. : {transactionNo || "-"}</p>
            </div>

            <dl className="mt-8 space-y-7">
              <div className="flex items-start justify-between gap-3">
                <DetailBlock label="Pet Sitter">
                  {sitter.displayName} By {sitter.sitterName}
                </DetailBlock>
                <button
                  type="button"
                  className="mt-6 inline-flex min-h-11 shrink-0 items-center gap-1.5 text-body-2 font-bold text-orange-500 hover:text-orange-400"
                >
                  <Icon src="/icon/map-pin.svg" className="size-4" />
                  View Map
                </button>
              </div>

              <div className="grid grid-cols-1 gap-7 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <DetailBlock label="Date & Time">
                  {dateLabel}
                  {" | "}
                  {formatTimeRange(startTime, endTime)}
                </DetailBlock>
                <DetailBlock label="Duration">{durationLabel}</DetailBlock>
              </div>

              <DetailBlock label="Pet">{petNames}</DetailBlock>
            </dl>

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-gray-100 pt-6">
              <span className="shrink-0 text-body-1 font-bold text-gray-900">
                Total
              </span>
              <span className="min-w-0 text-right text-h4 font-bold wrap-break-word text-gray-900">
                {formatCurrency(total)} THB
              </span>
            </div>
          </div>
        </div>

        {/* Figma mobile: ปุ่มคู่ขนาน */}
        <div className="relative z-10 mt-8 flex w-full flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/owner/bookings"
            className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center rounded-full bg-orange-100 px-4 text-body-2 font-bold text-orange-500 hover:bg-orange-200 sm:flex-none sm:min-w-50 sm:px-10"
          >
            Booking Detail
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center rounded-full bg-orange-500 px-4 text-body-2 font-bold text-white hover:bg-orange-400 sm:flex-none sm:min-w-50 sm:px-10"
          >
            Back To Home
          </Link>
        </div>
      </div>
    </div>
  );
}
