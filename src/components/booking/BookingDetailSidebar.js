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

function DetailBlock({ label, children }) {
  return (
    <div className="space-y-1">
      <dt className="text-body-3 text-gray-400">{label}:</dt>
      <dd className="text-body-2 font-medium text-gray-600">{children}</dd>
    </div>
  );
}

/** Sidebar สรุปการจอง — ยอดรวมเปลี่ยนตามจำนวนสัตว์ที่เลือก */
export default function BookingDetailSidebar({
  sitter,
  date,
  startTime,
  endTime,
  hours,
  selectedPets,
}) {
  const petCount = selectedPets.length;
  const total = calculateBookingTotal(hours, petCount);

  return (
    <aside className="flex h-full min-h-120 w-full flex-col overflow-hidden rounded-2xl bg-white shadow-(--shadow-card) lg:min-h-0 lg:w-82 lg:shrink-0">
      <div className="flex flex-1 flex-col px-6 pt-6 pb-6 sm:px-8">
        <h2 className="text-h4 font-bold text-gray-900">Booking Detail</h2>
        <div className="mt-4 h-px w-full bg-gray-100" aria-hidden />

        <dl className="mt-6 flex flex-col gap-6">
          <DetailBlock label="Pet Sitter">
            {sitter.displayName}  By {sitter.sitterName}
          </DetailBlock>

          <DetailBlock label="Date & Time">
            {formatBookingDate(date)} | {formatTimeRange(startTime, endTime)}
          </DetailBlock>

          <DetailBlock label="Duration">
            {hours} hour{hours !== 1 ? "s" : ""}
          </DetailBlock>

          <DetailBlock label="Pet">
            {petCount === 0
              ? "-"
              : selectedPets.map((pet) => pet.name).join(", ")}
          </DetailBlock>
        </dl>
      </div>

      <div className="mt-auto flex items-center justify-between bg-black px-6 py-5 text-white sm:px-8">
        <span className="text-body-2 font-medium">Total</span>
        <span className="text-h4 font-bold">{formatCurrency(total)} THB</span>
      </div>
    </aside>
  );
}
