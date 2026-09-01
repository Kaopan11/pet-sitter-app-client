"use client";

import Icon from "@/components/Icon";

/** Modal ยืนยันก่อนบันทึกบัญชี — ตาม Figma รูป 3 */
export default function PayoutConfirmModal({
  open,
  onClose,
  onConfirm,
  submitting = false,
  error = "",
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payout-confirm-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white">
        <header className="flex items-center justify-between border-b border-gray-200 px-8 py-6">
          <h2
            id="payout-confirm-title"
            className="text-h3 font-bold text-gray-600"
          >
            Payout Confirmation
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex size-8 cursor-pointer items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
            aria-label="Close"
          >
            <Icon src="/icon/x.svg" className="size-5" />
          </button>
        </header>

        <div className="flex flex-col gap-8 px-8 py-10">
          <p className="text-center text-body-2 text-gray-400">
            Are you sure to change your payout?
          </p>

          {error ? (
            <p className="text-center text-body-3 text-red" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex gap-4">
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
              {submitting ? "Saving..." : "Yes, I'm sure"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
