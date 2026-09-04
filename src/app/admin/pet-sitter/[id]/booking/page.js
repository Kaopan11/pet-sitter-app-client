"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { X } from "lucide-react";
import axios from "axios";
import {
  formatBookedDateDetail,
  formatBookedDateList,
  formatDate,
} from "@/utils/formatDateTime";
import { formatBookingDurationFromRecord } from "@/lib/booking";
import LoadingState from "@/components/LoadingState";
import Pagination from "@/components/Pagination";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const STATUS = {
  waiting_confirm: { label: "Waiting for confirm", text: "text-pink", dot: "bg-pink" },
  waiting_service: { label: "Waiting for service", text: "text-yellow", dot: "bg-yellow" },
  in_service: { label: "In service", text: "text-blue", dot: "bg-blue" },
  success: { label: "Success", text: "text-green", dot: "bg-green" },
  cancelled: { label: "Canceled", text: "text-red", dot: "bg-red" },
};

const PET_BADGE = {
  dog: "badge-dog",
  cat: "badge-cat",
  bird: "badge-bird",
  rabbit: "badge-rabbit",
};

function DetailField({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-h4 font-bold text-gray-300">{label}</p>
      <p className="text-body-2 text-black">{children}</p>
    </div>
  );
}

function BookingDetailModal({ booking, onClose }) {
  const ownerName = booking.pet_owner_name ?? "Booking Detail";
  const pets = booking.pets ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-detail-title"
        className="flex max-h-[90vh] w-full max-w-200 flex-col overflow-hidden rounded-2xl bg-white"
        onClick={(event) => event.stopPropagation()} // คลิกนี้จบที่กล่องขาวไม่ถือว่ากดกล่องดำ (ไม่ได้ปิดกล่องขาว)
      >
        <header className="flex shrink-0 items-center justify-between border-b border-gray-200 px-10 py-6">
          <h2
            id="booking-detail-title"
            className="text-h3 font-bold text-gray-600"
          >
            {ownerName}
          </h2>
          <button
            type="button"
            className="cursor-pointer text-gray-600 hover:text-gray-900"
            aria-label="Close"
            onClick={onClose}
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </header>

        <div className="flex min-h-0 flex-col gap-8 overflow-y-auto p-10">
          <DetailField label="Pet Owner Name">{ownerName}</DetailField>
          <DetailField label="Pet(s)">{booking.pet_count ?? 0}</DetailField>

          <section className="flex flex-col gap-2">
            <h3 className="text-h4 font-bold text-gray-300">Pet Detail</h3>
            {pets.length > 0 ? (
              <ul className="flex flex-wrap gap-4">
                {pets.map((pet) => {
                  const typeKey = String(pet.pet_type ?? "").toLowerCase();

                  return (
                    <li
                      key={pet.id}
                      className="flex w-51.75 flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6"
                    >
                      {pet.avatar_url ? (
                        <img
                          src={pet.avatar_url}
                          alt={`${pet.name} avatar`}
                          className="h-26 w-26 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="h-26 w-26 shrink-0 rounded-full bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="flex flex-col items-center gap-2.5">
                        <p className="text-h4 font-bold text-gray-600">
                          {pet.name}
                        </p>
                        <span
                          className={`badge ${PET_BADGE[typeKey] ?? "badge"}`}
                        >
                          {pet.pet_type}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-body-2 text-black">No pets</p>
            )}
          </section>

          <DetailField label="Duration">
            {formatBookingDurationFromRecord(booking)}
          </DetailField>
          <DetailField label="Booking Date">
            {formatBookedDateDetail(booking)}
          </DetailField>
          <DetailField label="Total Paid">
            {booking.total_price != null
              ? `${Number(booking.total_price)} THB`
              : "— THB"}
          </DetailField>
          <DetailField label="Transaction Date">
            {formatDate(booking.transaction_date) || "—"}
          </DetailField>
          <DetailField label="Transaction No.">
            {booking.transaction_no || "—"}
          </DetailField>
          <DetailField label="Additional Message">
            {booking.additional_message || "—"}
          </DetailField>
        </div>
      </section>
    </div>
  );
}

export default function AdminPetSitterBookingPage() {
  const { id } = useParams();
  const [bookingData, setBookingData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingDetail, setBookingDetail] = useState(null);

  const getBookingData = async (page) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/sitters/${id}/bookings`,
        { params: { page, limit: 7 } },
      );
      setBookingData(response.data.data ?? []);
      setCurrentPage(response.data.currentPage ?? page);
      setTotalPages(response.data.totalPages ?? 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookings");
      setBookingData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getBookingData(1);
  }, [id]);

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(1, page), Math.max(1, totalPages));
    getBookingData(nextPage);
  };

  async function getBookingDetail(bookingId) {
    const response = await axios.get(
      `${API_BASE_URL}/api/admin/sitters/${id}/bookings/${bookingId}`,
    );
    setBookingDetail(response.data.data ?? null);
  }

  if (isLoading) {
    return (
      <article className="rounded-2xl rounded-tl-none bg-white p-10">
        <LoadingState />
      </article>
    );
  }

  if (error) {
    return (
      <article className="rounded-2xl rounded-tl-none bg-white p-10">
        <p className="py-16 text-center text-body-2 text-red">{error}</p>
      </article>
    );
  }

  if (bookingData.length === 0) {
    return (
      <article className="rounded-2xl rounded-tl-none bg-white p-10">
        <p className="py-16 text-center text-body-2 text-gray-400">
          No bookings yet.
        </p>
      </article>
    );
  }

  return (
    <article className="flex flex-col gap-10 rounded-2xl rounded-tl-none bg-white p-10">
      <div className="overflow-hidden rounded-2xl">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Pet sitter bookings</caption>
          <thead className="bg-black text-white">
            <tr>
              <th className="border-0 px-6 py-4 text-body-3 font-medium">
                Pet Owner Name
              </th>
              <th className="border-0 px-6 py-4 text-body-3 font-medium">
                Pet(s)
              </th>
              <th className="border-0 px-6 py-4 text-body-3 font-medium">
                Duration
              </th>
              <th className="border-0 px-6 py-4 text-body-3 font-medium">
                Booked Date
              </th>
              <th className="border-0 px-6 py-4 text-body-3 font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {bookingData.map((booking) => (
              <tr
                key={booking.id}
                className="h-19 cursor-pointer border-b border-gray-200 last:border-b-0 hover:bg-gray-100"
                onClick={() => getBookingDetail(booking.id)}
              >
                <td className="px-6 py-5 text-body-2 text-black">
                  <span className="flex items-center gap-2">
                    {booking.isNew ? (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-orange-500"
                        aria-label="New booking"
                      />
                    ) : null}
                    {booking.pet_owner_name}
                  </span>
                </td>
                <td className="px-6 py-5 text-body-2 text-black">
                  {booking.pet_count}
                </td>
                <td className="px-6 py-5 text-body-2 text-black">
                  {formatBookingDurationFromRecord(booking)}
                </td>
                <td className="px-6 py-5 text-body-2 text-black">
                  {formatBookedDateList(booking)}
                </td>
                <td className="px-6 py-5 text-body-2">
                  <span
                    className={`flex items-center gap-2 ${STATUS[booking.status]?.text}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS[booking.status]?.dot}`}
                      aria-hidden="true"
                    />
                    {STATUS[booking.status]?.label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
      />

      {bookingDetail ? (
        <BookingDetailModal
          booking={bookingDetail}
          onClose={() => setBookingDetail(null)}
        />
      ) : null}
    </article>
  );
}
