"use client";

import { X } from "lucide-react";

export default function DeletePetModal({
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
      aria-labelledby="delete-pet-title"
    >
      <div className="my-auto w-full max-w-md rounded-2xl bg-white p-5 shadow-(--shadow-dropdown) sm:p-8">
        <div className="flex items-start justify-between gap-3 border-b border-gray-200 pb-4">
          <h2
            id="delete-pet-title"
            className="min-w-0 text-h4 font-bold text-black"
          >
            Delete Confirmation
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X className="size-5" strokeWidth={2} />
          </button>
        </div>

        <p className="mt-6 text-body-2 text-gray-500">
          Are you sure to delete this pet?
        </p>

        {error ? (
          <p className="mt-4 text-body-3 text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="btn btn-secondary w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="btn btn-primary w-full sm:w-auto"
          >
            {submitting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
