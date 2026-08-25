"use client";

import Icon from "@/components/Icon";

/** Modal ยืนยันก่อนจอง — Yes → POST /api/bookings (cash) */
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-confirm-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-(--shadow-dropdown) sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2
            id="booking-confirm-title"
            className="text-h4 font-bold text-gray-900"
          >
            Booking Confirmation
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <Icon src="/icon/x.svg" className="size-5" />
          </button>
        </div>

        <p className="mt-4 text-body-2 text-gray-500">
          Are you sure to booking this pet sitter?
        </p>

        {error ? (
          <p className="mt-4 text-body-3 text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-orange-100 px-6 text-body-2 font-bold text-orange-500 hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-orange-500 px-6 text-body-2 font-bold text-white hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Booking..." : "Yes, I'm sure"}
          </button>
        </div>
      </div>
    </div>
  );
}
