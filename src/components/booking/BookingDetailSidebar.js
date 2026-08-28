import {
  calculateBookingPreviewTotal,
  formatBookingDateTimeLabel,
  formatBookingDuration,
} from "@/lib/booking";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function DetailBlock({ label, children }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-body-3 text-gray-400">{label}:</dt>
      <dd className="text-body-2 font-medium wrap-break-word text-gray-600">
        {children}
      </dd>
    </div>
  );
}

/**
 * สรุปการจอง
 * hideTotal — mobile ย้าย Total ไป sticky footer (Figma)
 */
export default function BookingDetailSidebar({
  sitter,
  startDate,
  endDate,
  startTime,
  endTime,
  hours,
  isManyDays = false,
  nights = null,
  selectedPets,
  hideTotal = false,
}) {
  const petCount = selectedPets.length;
  const total = calculateBookingPreviewTotal({
    isManyDays,
    hours,
    nights,
    petCount,
  });

  const dateTimeLabel = formatBookingDateTimeLabel({
    startDate,
    endDate,
    startTime,
    endTime,
    isManyDays,
  });

  const durationLabel = isManyDays
    ? formatBookingDuration(nights, "Day")
    : formatBookingDuration(hours, "hours");

  return (
    <aside className="flex w-full min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-(--shadow-card) md:h-full md:w-82 md:shrink-0">
      <div className="flex flex-1 flex-col px-4 pt-5 pb-5 sm:px-8 sm:pt-6 sm:pb-6">
        <h2 className="text-h4 font-bold text-gray-900">Booking Detail</h2>
        <div className="mt-4 h-px w-full bg-gray-100" aria-hidden />

        <dl className="mt-5 flex flex-col gap-5 sm:mt-6 sm:gap-6">
          <DetailBlock label="Pet Sitter">
            {sitter.displayName} By {sitter.sitterName}
          </DetailBlock>

          <DetailBlock label="Date & Time">{dateTimeLabel}</DetailBlock>

          <DetailBlock label="Duration">{durationLabel}</DetailBlock>

          <DetailBlock label="Pet">
            {petCount === 0
              ? "-"
              : selectedPets.map((pet) => pet.name).join(", ")}
          </DetailBlock>
        </dl>
      </div>

      {!hideTotal ? (
        <div className="mt-auto flex items-center justify-between gap-3 bg-black px-4 py-4 text-white sm:px-8 sm:py-5">
          <span className="shrink-0 text-body-2 font-medium">Total</span>
          <span className="min-w-0 text-right text-h4 font-bold wrap-break-word">
            {formatCurrency(total)} THB
          </span>
        </div>
      ) : null}
    </aside>
  );
}
