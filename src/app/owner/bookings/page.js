"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, SquarePen, X, MapPin } from "lucide-react";
import AccountSidebar from "../../../components/AccountSidebar";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Mock data for testing/demo
const MOCK_BOOKINGS = [
  {
    id: "1",
    sitter: {
      name: "Happy Housel",
      avatar_url: "https://i.pravatar.cc/150?img=1",
    },
    owner_name: "Jane Maison",
    pet: { name: "Bubba, Daisy" },
    booking_date: "2025-08-25",
    transaction_date: "Tue, 16 Aug 2023",
    date_label: "Transaction date",
    transaction_no: "122312",
    total: 900,
    start_time: "07:00",
    end_time: "10:00",
    duration: 3,
    status: "pending",
    has_review: false,
  },
  {
    id: "2",
    sitter: {
      name: "Gentle >< for all pet! (Kid friendly)",
      avatar_url: "https://i.pravatar.cc/150?img=2",
    },
    owner_name: "Jane Maison",
    pet: { name: "Mr.Ham, Bingsu" },
    booking_date: "2025-08-25",
    transaction_date: "Tue, 14 Aug 2023",
    date_label: "Booking date",
    transaction_no: "122313",
    total: 900,
    start_time: "07:00",
    end_time: "10:00",
    duration: 3,
    status: "ongoing",
    has_review: false,
  },
  {
    id: "3",
    sitter: {
      name: "We love cat and your cat",
      avatar_url: "https://i.pravatar.cc/150?img=3",
    },
    owner_name: "Jane Maison",
    pet: { name: "Mr.Ham, Bingsu" },
    booking_date: "2025-08-25",
    transaction_date: "Tue, 24 Apr 2023",
    date_label: "Booking date",
    transaction_no: "122314",
    total: 900,
    start_time: "07:00",
    end_time: "10:00",
    duration: 3,
    status: "completed",
    completed_date: "2025-08-26",
    completed_time: "11:03",
    has_review: false,
  },
  {
    id: "4",
    sitter: {
      name: "Happy energetic pup",
      avatar_url: "https://i.pravatar.cc/150?img=4",
    },
    owner_name: "Jane Maison",
    pet: { name: "Mr.Ham, Bingsu" },
    booking_date: "2025-08-25",
    transaction_date: "Tue, 16 Aug 2023",
    date_label: "Transaction date",
    transaction_no: "122315",
    total: 900,
    start_time: "07:00",
    end_time: "10:00",
    duration: 3,
    status: "completed",
    completed_date: "2025-08-13",
    completed_time: "8:40",
    has_review: true,
  },
];

export default function BookingHistoryPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBookings() {
      if (!getToken()) {
        router.replace("/login/owner");
        return;
      }

      try {
        const token = getToken();
        const res = await fetch(`${API_URL}/api/bookings/owner`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            router.replace("/login/owner");
            return;
          }
          throw new Error("Failed to load bookings");
        }

        const json = await res.json();
        if (!cancelled) {
          setBookings(json.data || []);
        }
      } catch (error) {
        if (!cancelled) {
          // Use mock data in development
          if (process.env.NODE_ENV === "development") {
            setBookings(MOCK_BOOKINGS);
            setLoadError("");
          } else {
            setLoadError(error.message || "Failed to load bookings");
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadBookings();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "#FA8AC0", label: "Waiting for confirm" },
      confirmed: { color: "#76D0FC", label: "Confirmed" },
      ongoing: { color: "#76D0FC", label: "In service" },
      completed: { color: "#1CCD83", label: "Success" },
      cancelled: { color: "#EA1010", label: "Cancelled" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className="inline-flex items-center gap-2 text-body-2"
        style={{ color: config.color }}
      >
        <span
          className="inline-block rounded-full"
          style={{ width: "6px", height: "6px", backgroundColor: config.color }}
        />
        {config.label}
      </span>
    );
  };


  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  return (
    <div className="flex min-h-full bg-gray-100">
      <div className="mx-4 mt-6 flex w-full flex-col gap-4 pb-8 sm:mx-6 lg:mx-10 lg:flex-row lg:justify-center lg:gap-0">
        <AccountSidebar />

        <div className="card flex w-full flex-col p-4 sm:p-6 lg:m-4 lg:ml-6 lg:w-2/3 lg:p-8">
          <h2 className="mb-6 text-h2 lg:mb-8" style={{ fontSize: "clamp(1.5rem, 5vw, 2.25rem)" }}>
            Booking History
          </h2>

          {loadError && (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              {loadError}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading bookings...</div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-12 text-center">
              <p className="text-gray-500">No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className="w-full bg-white hover:shadow-md transition-shadow flex flex-col p-4 sm:p-6 cursor-pointer"
                  style={{
                    borderRadius: "16px",
                    border: `1px solid ${
                      booking.status === "ongoing"
                        ? "#76D0FC"
                        : booking.status === "completed"
                        ? "#1CCD83"
                        : "#DCDFED"
                    }`
                  }}
                >
                  {/* Header: Sitter info + Transaction date + Status badge */}
                  <div
                    className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                    style={{ borderBottom: "1px solid #DCDFED", paddingBottom: "16px", marginBottom: "16px" }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative size-14 sm:size-16 overflow-hidden rounded-full bg-gray-200 shrink-0">
                        {booking.sitter?.avatar_url ? (
                          <img
                            src={booking.sitter.avatar_url}
                            alt={booking.sitter.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="size-full bg-gray-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3
                          className="text-h3 break-words"
                          style={{ color: "#000000", fontSize: "clamp(1.125rem, 4vw, 1.5rem)" }}
                        >
                          {booking.sitter?.name || "Unknown"}
                        </h3>
                        <p
                          className="text-body-1"
                          style={{ color: "#000000", fontSize: "clamp(0.9375rem, 3vw, 1.125rem)" }}
                        >
                          By {booking.owner_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <p className="mb-2 text-body-3" style={{ color: "#AEB1C3" }}>
                        {booking.date_label || "Booking date"}: {booking.transaction_date}
                      </p>
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>

                  {/* Booking Details Row */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-0" style={{ marginBottom: "24px" }}>
                    <div className="flex flex-col sm:pr-6 sm:border-r" style={{ borderColor: "#DCDFED" }}>
                      <span className="text-body-3 mb-1" style={{ color: "#7B7E8F" }}>
                        Date & Time:
                      </span>
                      <span className="flex flex-wrap items-center gap-2 text-body-2" style={{ color: "#3A3B46" }}>
                        {formatDate(booking.booking_date)} | {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        {booking.status === "pending" && (
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity text-body-2"
                            style={{ color: "#FF7037", fontWeight: 700, textAlign: "center" }}
                          >
                            <SquarePen style={{ width: "20.01px", height: "20.01px", color: "#FF7037" }} />
                            Change
                          </button>
                        )}
                      </span>
                    </div>

                    <div className="flex flex-col sm:px-6 sm:border-r" style={{ borderColor: "#DCDFED" }}>
                      <span className="text-body-3 mb-1" style={{ color: "#7B7E8F" }}>
                        Duration:
                      </span>
                      <span className="text-body-2" style={{ color: "#3A3B46" }}>
                        {booking.duration} hours
                      </span>
                    </div>

                    <div className="flex flex-col sm:pl-6">
                      <span className="text-body-3 mb-1" style={{ color: "#7B7E8F" }}>
                        Pet:
                      </span>
                      <span className="text-body-2" style={{ color: "#3A3B46" }}>
                        {booking.pet?.name}
                      </span>
                    </div>
                  </div>

                  {/* Status Message Box with Actions */}
                  <div>
                    {booking.status === "pending" && (
                      <div
                        className="w-full flex items-center"
                        style={{ backgroundColor: "#F6F6F9", padding: "16px", borderRadius: "8px", gap: "16px", minHeight: "80px", boxSizing: "border-box" }}
                      >
                        <span className="text-body-3" style={{ color: "#7B7E8F" }}>
                          Waiting Pet Sitter for confirm booking
                        </span>
                      </div>
                    )}
                    {booking.status === "ongoing" && (
                      <div
                        className="w-full flex flex-col items-stretch sm:flex-row sm:items-center sm:justify-between"
                        style={{ backgroundColor: "#F6F6F9", padding: "16px", gap: "16px", borderRadius: "8px", boxSizing: "border-box" }}
                      >
                        <span className="text-body-3" style={{ color: "#7B7E8F" }}>
                          Your pet is already in Pet Sitter care!
                        </span>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); toast.info("Messaging feature coming soon"); }}
                            className="btn btn-primary flex-1 sm:flex-none"
                            style={{ minWidth: "120px" }}
                          >
                            Send Message
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); toast.info("Call feature coming soon"); }}
                            className="btn btn-icon shrink-0"
                            style={{ width: "48px", height: "48px" }}
                            title="Call"
                          >
                            <Phone className="size-6" />
                          </button>
                        </div>
                      </div>
                    )}
                    {booking.status === "completed" && (
                      <div
                        className="w-full flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between"
                        style={{ backgroundColor: "#E7FDF4", padding: "16px", borderRadius: "8px", minHeight: "80px", boxSizing: "border-box" }}
                      >
                        <div className="flex flex-col">
                          <span className="text-body-3" style={{ color: "#1CCD83" }}>
                            Success date:
                          </span>
                          <span className="text-body-3" style={{ color: "#1CCD83" }}>
                            {formatDate(booking.completed_date)} | {booking.completed_time} AM
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); toast.info("Report feature coming soon"); }}
                            className="btn btn-ghost shrink-0"
                          >
                            Report
                          </button>
                          {booking.has_review ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); toast.info("Your review feature coming soon"); }}
                              className="btn btn-primary flex-1 sm:flex-none"
                              style={{ minWidth: "120px" }}
                            >
                              Your Review
                            </button>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); toast.info("Review feature coming soon"); }}
                              className="btn btn-primary flex-1 sm:flex-none"
                              style={{ minWidth: "120px" }}
                            >
                              Review
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="w-full flex flex-col bg-white font-sans"
            style={{
              maxWidth: "632px",
              height: "auto",
              borderRadius: "16px",
              boxShadow: "0px 4px 24px 0px rgba(0, 0, 0, 0.04)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #DCDFED" }}>
              <h3 className="text-h3" style={{ color: "#3A3B46" }}>
                Booking Detail
              </h3>
              <button onClick={() => setSelectedBooking(null)} aria-label="Close" className="hover:opacity-70 transition-opacity">
                <X className="size-5" style={{ color: "#3A3B46" }} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col gap-4 px-6 py-5">
              {getStatusBadge(selectedBooking.status)}

              <div className="flex flex-col gap-1">
                <p className="text-body-3" style={{ color: "#AEB1C3" }}>
                  {selectedBooking.date_label || "Booking date"}: {selectedBooking.transaction_date}
                </p>
                {selectedBooking.transaction_no && (
                  <p className="text-body-3" style={{ color: "#AEB1C3" }}>
                    Transaction No. : {selectedBooking.transaction_no}
                  </p>
                )}
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-body-3" style={{ color: "#7B7E8F" }}>Pet Sitter:</span>
                  <span className="text-body-2" style={{ color: "#3A3B46" }}>
                    {selectedBooking.sitter?.name} By {selectedBooking.owner_name}
                  </span>
                </div>
                <button
                  onClick={() => toast.info("Map feature coming soon")}
                  className="inline-flex items-center gap-1 shrink-0 hover:opacity-80 transition-opacity text-body-2"
                  style={{ color: "#FF7037", fontWeight: 700, textAlign: "center" }}
                >
                  <MapPin style={{ width: "20.01px", height: "20.01px", color: "#FF7037" }} />
                  View Map
                </button>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-body-3" style={{ color: "#7B7E8F" }}>Date & Time:</span>
                  <span className="text-body-2" style={{ color: "#3A3B46", fontWeight: 700 }}>
                    {formatDate(selectedBooking.booking_date)} | {formatTime(selectedBooking.start_time)} - {formatTime(selectedBooking.end_time)}
                  </span>
                </div>
                {selectedBooking.status === "pending" && (
                  <button
                    onClick={() => toast.info("Change booking feature coming soon")}
                    className="inline-flex items-center gap-1 shrink-0 hover:opacity-80 transition-opacity text-body-2"
                    style={{ color: "#FF7037", fontWeight: 700, textAlign: "center" }}
                  >
                    <SquarePen style={{ width: "20.01px", height: "20.01px", color: "#FF7037" }} />
                    Change
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-body-3" style={{ color: "#7B7E8F" }}>Duration:</span>
                <span className="text-body-2" style={{ color: "#3A3B46", fontWeight: 700 }}>{selectedBooking.duration} hours</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-body-3" style={{ color: "#7B7E8F" }}>Pet:</span>
                <span className="text-body-2" style={{ color: "#3A3B46" }}>{selectedBooking.pet?.name}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="flex items-center justify-between"
              style={{
                marginLeft: "24px",
                marginRight: "24px",
                marginBottom: "24px",
                borderTop: "1px solid #DCDFED",
                paddingTop: "16px",
                gap: "16px",
                minHeight: "44px"
              }}
            >
              <span className="text-body-2" style={{ color: "#000000" }}>Total</span>
              <span className="text-body-1" style={{ color: "#000000", textAlign: "right" }}>
                {selectedBooking.total ? `${selectedBooking.total} THB` : "-"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
