"use client";

/**
 * หน้า Thank You หลังยืนยันจอง (mock)
 * transactionNo ยังเป็นค่าคงที่ — Day ถัดไปจะมาจาก API
 */

import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/Icon";
import {
  calculateBookingTotal,
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

function DetailBlock({ label, children, nowrap = false }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <dt className="text-body-3 font-medium text-gray-400">{label}:</dt>
      <dd
        className={`text-body-1 font-bold text-gray-900 ${
          nowrap ? "whitespace-nowrap" : ""
        }`}
      >
        {children}
      </dd>
    </div>
  );
}

export default function ThankYouView({
  sitter,
  date,
  startTime,
  endTime,
  hours,
  selectedPets,
  transactionNo = "122312",
}) {
  const total = calculateBookingTotal(hours, selectedPets.length);
  const petNames =
    selectedPets.length === 0
      ? "-"
      : selectedPets.map((pet) => pet.name).join(", ");

  return (
    <div
      className="relative overflow-hidden px-4 py-12 sm:px-8 sm:py-16"
      style={{ minHeight: "calc(100vh - 5rem)" }}
    >
      {/* มุมซ้ายบน — โค้งเขียว + ก้อนชมพู */}
      <Image
        src="/image/cloud-pink-arc-green.svg"
        alt=""
        width={288}
        height={337}
        className="pointer-events-none absolute -top-6 -left-10 z-0 hidden w-50 lg:block xl:w-65"
        aria-hidden
        priority
      />

      {/* มุมขวาล่าง — แมว + โค้งเหลือง */}
      <Image
        src="/image/cat-arc-yellow.svg"
        alt=""
        width={311}
        height={465}
        className="pointer-events-none absolute right-0 bottom-0 z-0 hidden w-55 lg:block xl:w-70"
        aria-hidden
        priority
      />

      {/* ดาวฟ้าตาม Figma (ระหว่างการ์ดกับแมว) */}
      <Image
        src="/image/pill-blue.svg"
        alt=""
        width={80}
        height={80}
        className="pointer-events-none absolute right-28 bottom-52 z-0 hidden lg:block xl:right-40 xl:bottom-64"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-160">
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <div className="bg-black px-8 py-14 text-center text-white sm:px-12">
            <h1 className="text-h2 font-bold tracking-tight text-white sm:text-[2rem] sm:leading-10">
              Thank You For Booking
            </h1>
            <p className="mt-3 text-body-2 font-medium text-white/90">
              We will send your booking information to Pet Sitter.
            </p>
          </div>

          <div className="px-8 py-8 sm:px-10 sm:py-10">
            <div className="space-y-1 text-body-3 font-medium text-gray-400">
              <p>Transaction Date: {formatTransactionDate()}</p>
              <p>Transaction No. : {transactionNo}</p>
            </div>

            <dl className="mt-8 space-y-7">
              <div className="flex items-start justify-between gap-4">
                <DetailBlock label="Pet Sitter">
                  {sitter.displayName} By {sitter.sitterName}
                </DetailBlock>
                <button
                  type="button"
                  className="mt-6 inline-flex shrink-0 items-center gap-1.5 text-body-2 font-bold text-orange-500 hover:text-orange-400"
                >
                  <Icon src="/icon/map-pin.svg" className="size-4" />
                  View Map
                </button>
              </div>

              <div className="grid grid-cols-1 gap-7 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <DetailBlock label="Date & Time" nowrap>
                  {formatBookingDate(date)}
                  {" | "}
                  {formatTimeRange(startTime, endTime)}
                </DetailBlock>
                <DetailBlock label="Duration">
                  {hours} hour{hours !== 1 ? "s" : ""}
                </DetailBlock>
              </div>

              <DetailBlock label="Pet">{petNames}</DetailBlock>
            </dl>

            <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
              <span className="text-body-1 font-bold text-gray-900">Total</span>
              <span className="text-h4 font-bold text-gray-900">
                {formatCurrency(total)} THB
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/owner/bookings"
            className="inline-flex min-h-12 min-w-50 items-center justify-center rounded-full bg-orange-100 px-10 text-body-2 font-bold text-orange-500 hover:bg-orange-200"
          >
            Booking Detail
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-12 min-w-50 items-center justify-center rounded-full bg-orange-500 px-10 text-body-2 font-bold text-white hover:bg-orange-400"
          >
            Back To Home
          </Link>
        </div>
      </div>
    </div>
  );
}
