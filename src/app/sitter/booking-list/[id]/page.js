"use client";

import Link from "next/link";
import { Eye, X } from "lucide-react";
import Icon from "@/components/Icon";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { formatBookedDateDetail, formatDate } from "@/utils/formatDateTime";
import {
  errorToastClassNames,
  successToastClassNames,
} from "@/lib/toastStyles";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const STATUS = {
  waiting_confirm: { label: "Waiting for confirm", text: "text-pink", dot: "bg-pink" },
  waiting_service: { label: "Waiting for service", text: "text-yellow", dot: "bg-yellow" },
  in_service: { label: "In service", text: "text-blue", dot: "bg-blue" },
  success: { label: "Success", text: "text-green", dot: "bg-green" },
  cancelled: { label: "Canceled", text: "text-red", dot: "bg-red" },
};

export default function BookingDetailPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showOwner, setShowOwner] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const getBookingById = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/sitters/bookings/${id}`);
    setBooking(response.data.data ?? null);
  };

  useEffect(() => {
    if (!id) return;
    getBookingById();
  }, [id]);

  const updateBookingStatus = async (nextStatus, successMessage) => {
    if (!id || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      await axios.patch(`${API_BASE_URL}/api/sitters/bookings/${id}/status`, {
        status: nextStatus,
      });
      setShowRejectModal(false);
      await getBookingById();
      toast(successMessage, {
        classNames: successToastClassNames,
      });
    } catch (error) {
      toast(error.response?.data?.message || "Failed to update booking status", {
        classNames: errorToastClassNames,
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const statusKey = booking?.status;
  const status = STATUS[statusKey];
  const ownerName = booking?.pet_owner_name ?? "—";
  const owner = booking?.pet_owner;
  const pets = booking?.pets ?? [];

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <Link
            href="/sitter/booking-list"
            className="flex items-center gap-3 text-gray-900"
            aria-label="Back to booking list"
          >
            <Icon src="/icon/chevron-left.svg" className="h-4.5 w-4.5 text-gray-400" />
            <h1 className="text-h3 font-bold text-black">{ownerName}</h1>
          </Link>
          {booking ? (
            <p className={`flex items-center gap-2 text-body-2 ${status.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
              {status.label}
            </p>
          ) : null}
        </div>

        {booking ? (
          <div className="flex items-center gap-4">
            {statusKey === "waiting_confirm" ? (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={isUpdatingStatus}
                  onClick={() => setShowRejectModal(true)}
                >
                  Reject Booking
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={isUpdatingStatus}
                  onClick={() =>
                    updateBookingStatus("waiting_service", "Booking confirmed")
                  }
                >
                  Confirm Booking
                </button>
              </>
            ) : null}
            {statusKey === "waiting_service" ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={isUpdatingStatus}
                onClick={() =>
                  updateBookingStatus("in_service", "Booking is in service")
                }
              >
                In Service
              </button>
            ) : null}
            {statusKey === "in_service" ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={isUpdatingStatus}
                onClick={() =>
                  updateBookingStatus("success", "Booking completed")
                }
              >
                Success
              </button>
            ) : null}
          </div>
        ) : null}
      </header>

      <article className="flex flex-col gap-8 rounded-2xl bg-white px-16 py-10">
        <div className="flex items-start justify-between gap-4">
          <DetailField label="Pet Owner Name">{ownerName}</DetailField>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 text-body-2 font-bold text-orange-500"
            onClick={() => setShowOwner(true)}
          >
            <Eye className="h-6 w-6" aria-hidden="true" />
            View Profile
          </button>
        </div>

        <DetailField label="Pet(s)">{booking?.pet_count ?? 0}</DetailField>

        <section className="flex flex-col gap-2">
          <h2 className="text-h4 font-bold text-gray-300">Pet Detail</h2>
          {pets.length > 0 ? (
            <ul className="flex flex-wrap gap-4">
              {pets.map((pet) => (
                <li key={pet.id}>
                  <button
                    type="button"
                    className="flex w-[207px] cursor-pointer flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 text-left"
                    onClick={() => setSelectedPet(pet)}
                  >
                    {pet.avatar_url ? (
                      <img
                        src={pet.avatar_url}
                        alt={`${pet.name} avatar`}
                        className="h-26 w-26 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="h-20 w-20 shrink-0 rounded-full bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="flex flex-col items-center gap-2.5">
                      <p className="text-h4 font-bold text-gray-600">{pet.name}</p>
                      <p className="w-16 rounded-full border border-green bg-green-100 px-4 py-1 text-center text-body-2 text-green-500">
                        {pet.pet_type}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body-2 text-black">No pets</p>
          )}
        </section>

        <DetailField label="Duration">
          {booking?.duration_hours != null ? `${Number(booking.duration_hours)} hours` : "—"}
        </DetailField>
        <DetailField label="Booking Date">
          {booking ? formatBookedDateDetail(booking) : "—"}
        </DetailField>
        <DetailField label="Total Paid">
          {booking?.total_price != null ? `${Number(booking.total_price)} THB` : "— THB"}
        </DetailField>
        <DetailField label="Transaction Date">
          {formatDate(booking?.transaction_date) || "—"}
        </DetailField>
        <DetailField label="Transaction No.">
          {booking?.transaction_no || "—"}
        </DetailField>
        <DetailField label="Additional Message">
          {booking?.additional_message || "—"}
        </DetailField>
      </article>

      {selectedPet ? (
        <Modal name={selectedPet.name} onClose={() => setSelectedPet(null)}>
          <div className="flex gap-10">
            <div className="flex w-60 shrink-0 flex-col items-center gap-4">
              {selectedPet.avatar_url ? (
                <img
                  src={selectedPet.avatar_url}
                  alt={`${selectedPet.name} avatar`}
                  className="h-60 w-60 rounded-full object-cover"
                />
              ) : (
                <div className="h-60 w-60 rounded-full bg-gray-200" aria-hidden="true" />
              )}
              <p className="w-full text-center text-h4 font-bold text-black">
                {selectedPet.name}
              </p>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-x-10 gap-y-6 rounded-lg bg-[#FAFAFB] p-6">
              <DetailField label="Pet Type">{selectedPet.pet_type || "—"}</DetailField>
              <DetailField label="Breed">{selectedPet.breed || "—"}</DetailField>
              <DetailField label="Sex">{selectedPet.sex || "—"}</DetailField>
              <DetailField label="Age">
                {selectedPet.age_months != null ? `${selectedPet.age_months} Month` : "—"}
              </DetailField>
              <DetailField label="Color">{selectedPet.color || "—"}</DetailField>
              <DetailField label="Weight">
                {selectedPet.weight_kg != null ? `${selectedPet.weight_kg} Kilogram` : "—"}
              </DetailField>
              <DetailField label="About">{selectedPet.about || "—"}</DetailField>
            </div>
          </div>
        </Modal>
      ) : null}

      {showOwner ? (
        <Modal name={owner.name || ownerName} onClose={() => setShowOwner(false)}>
          <div className="flex w-full items-start gap-10">
            <div className="flex w-60 shrink-0 justify-center">
              {owner.avatar_url ? (
                <img
                  src={owner.avatar_url}
                  alt={`${owner.name || ownerName} avatar`}
                  className="h-60 w-60 rounded-full object-cover"
                />
              ) : (
                <div className="h-60 w-60 rounded-full bg-gray-200" aria-hidden="true" />
              )}
            </div>
            <div className="flex w-[440px] flex-col gap-10 rounded-lg bg-[#FAFAFB] p-6">
              <DetailField label="Pet Owner Name">{owner.name || "—"}</DetailField>
              <DetailField label="Email">{owner.email || "—"}</DetailField>
              <DetailField label="Phone">{owner.phone || "—"}</DetailField>
              <DetailField label="ID Number">{owner.id_number || "—"}</DetailField>
              <DetailField label="Date of Birth">
                {formatDate(owner.date_of_birth) || "—"}
              </DetailField>
            </div>
          </div>
        </Modal>
      ) : null}

      {showRejectModal ? (
        <Modal
          name="Reject Confirmation"
          className="max-w-md"
          onClose={() => setShowRejectModal(false)}
        >
          <div className="flex flex-col gap-8">
            <p className="text-body-2 text-gray-400">
              Are you sure to reject this booking?
            </p>
            <div className="flex justify-between">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isUpdatingStatus}
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={isUpdatingStatus}
                onClick={() =>
                  updateBookingStatus("cancelled", "Booking rejected")
                }
              >
                Reject Booking
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </section>
  );
}

function Modal({ name, onClose, children, className = "max-w-200" }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full rounded-2xl bg-white ${className}`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-gray-200 px-10 py-6">
          <h2 className="text-h3 font-bold text-gray-600">{name}</h2>
          <button
            type="button"
            className="cursor-pointer text-gray-600 hover:text-gray-900"
            aria-label="Close"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        </header>
        <div className="p-10">{children}</div>
      </div>
    </div>
  );
}

function DetailField({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-h4 font-bold text-gray-300">{label}</p>
      <p className="text-body-2 text-black">{children}</p>
    </div>
  );
}
