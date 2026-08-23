"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, AlertCircle, CheckCircle, Clock, MapPin, Calendar, Clock3 } from "lucide-react";
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
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Waiting for confirmation" },
      confirmed: { bg: "bg-blue-100", text: "text-blue-700", label: "Confirmed" },
      ongoing: { bg: "bg-green-100", text: "text-green-700", label: "In Progress" },
      completed: { bg: "bg-green-100", text: "text-green-700", label: "Successful" },
      cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>
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
    <div className="flex h-full bg-gray-100">
      <div className="mx-10 mt-6 flex w-full flex-row justify-center">
        <AccountSidebar />

        <div className="card m-4 ml-6 flex flex-col w-2/3 p-6 sm:p-8">
          <h2 className="text-h2 mb-8">Booking History</h2>

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
                  className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 hover:shadow-md transition-shadow"
                >
                  {/* Header: Sitter info + Transaction date + Status badge */}
                  <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="relative size-16 overflow-hidden rounded-full bg-gray-200 shrink-0">
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
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{booking.sitter?.name || "Unknown"}</h3>
                        <p className="text-sm text-gray-600">By {booking.owner_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-2">{booking.transaction_date}</p>
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>

                  {/* Booking Details Row */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4 pb-4 border-b border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-1">Date & Time:</p>
                      <p className="text-sm text-gray-900 font-medium">
                        {formatDate(booking.booking_date)} | {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </p>
                      {booking.status === "pending" && (
                        <button className="text-orange-500 text-xs font-semibold mt-1 hover:text-orange-600">
                          ✎ Change
                        </button>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-1">Duration:</p>
                      <p className="text-sm text-gray-900 font-medium">{booking.duration} hours</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-1">Pet:</p>
                      <p className="text-sm text-gray-900 font-medium">{booking.pet?.name}</p>
                    </div>
                  </div>

                  {/* Status Message Box */}
                  <div className="mb-6">
                    {booking.status === "pending" && (
                      <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                        Waiting Pet Sitter for confirm booking
                      </div>
                    )}
                    {booking.status === "ongoing" && (
                      <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                        Your pet is already in Pet Sitter care!
                      </div>
                    )}
                    {booking.status === "completed" && (
                      <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                        <p className="font-semibold">Success date:</p>
                        <p className="text-green-600">{formatDate(booking.completed_date)} | {booking.completed_time} AM</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    {booking.status === "pending" && (
                      <button
                        onClick={() => toast.info("Messaging feature coming soon")}
                        className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
                      >
                        <MessageCircle className="size-4" />
                        Send Message
                      </button>
                    )}
                    {booking.status === "ongoing" && (
                      <button
                        onClick={() => toast.info("Messaging feature coming soon")}
                        className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
                      >
                        Send Message
                      </button>
                    )}
                    {booking.status === "completed" && (
                      <>
                        <button
                          onClick={() => toast.info("Report feature coming soon")}
                          className="text-orange-500 text-sm font-semibold hover:text-orange-600 transition-colors"
                        >
                          Report
                        </button>
                        {booking.has_review ? (
                          <button
                            onClick={() => toast.info("Your review feature coming soon")}
                            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
                          >
                            Your Review
                          </button>
                        ) : (
                          <button
                            onClick={() => toast.info("Review feature coming soon")}
                            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
                          >
                            Review
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
