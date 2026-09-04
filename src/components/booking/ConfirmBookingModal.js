"use client";

import Icon from "@/components/Icon";

/** Modal ยืนยันก่อนจอง — Yes → POST /api/bookings (cash | stripe) */
export default function ConfirmBookingModal({
  open,
  onClose,
  onConfirm,
  submitting = false,
  error = "",
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/40 px-4 py-6 sm:items-center sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-confirm-title"
    >
      <div className="my-auto max-h-[min(90vh,40rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-(--shadow-dropdown) sm:p-8">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <h2
            id="booking-confirm-title"
            className="min-w-0 text-h4 font-bold wrap-break-word text-gray-900"
          >
            Booking Confirmation
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50 sm:size-8"
            aria-label="Close"
          >
            <Icon src="/icon/x.svg" className="size-5" />
          </button>
        </div>

        <p className="mt-4 text-body-2 text-gray-500">
          Are you sure to booking this pet sitter?
        </p>

        {error ? (
          <p className="mt-4 text-body-3 wrap-break-word text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
          {/* ใช้ .btn จาก globals — มี cursor: pointer + hover ตาม design system */}
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="btn btn-secondary min-h-12 flex-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="btn btn-primary min-h-12 flex-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Booking..." : "Yes, I'm sure"}
          </button>
        </div>
      </div>
    </div>
  );
}
