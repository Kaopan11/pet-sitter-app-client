"use client";

import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { formatBookedDateList } from "@/utils/formatDateTime";
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

export default function BookingListPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const getBookingData = async (page) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/sitters/bookings`, {
        params: { status, search, page, limit: 7 },
      });
      setBookingData(response.data.data ?? []);
      setCurrentPage(response.data.currentPage ?? page);
      setTotalPages(response.data.totalPages ?? 1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getBookingData(1);
  }, [search, status]);

  const goToPage = (page) => {
    const clickedPage = Math.min(Math.max(1, page), Math.max(1, totalPages));
    getBookingData(clickedPage);
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-h3 font-bold text-gray-900">Booking List</h1>

        <div className="flex items-center gap-4">
          <label className="relative block w-60">
            <input
              className="input pr-10"
              type="search"
              name="search"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search
              className="pointer-events-none absolute top-1/2 right-3 h-6 w-6 -translate-y-1/2 text-gray-300"
              aria-hidden="true"
            />
          </label>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-60" aria-label="Filter by status">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              {Object.entries(STATUS).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl bg-white">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Pet sitter booking list</caption>
              <thead className="bg-black text-white">
                <tr>
                  <th className="border-0 px-6 py-4 text-body-3 font-medium">Pet Owner Name</th>
                  <th className="border-0 px-6 py-4 text-body-3 font-medium">Pet(s)</th>
                  <th className="border-0 px-6 py-4 text-body-3 font-medium">Duration</th>
                  <th className="border-0 px-6 py-4 text-body-3 font-medium">Booked Date</th>
                  <th className="border-0 px-6 py-4 text-body-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookingData.map((booking) => (
                  <tr
                    key={booking.id}
                    className="h-19 cursor-pointer border-b border-gray-200 last:border-b-0 hover:bg-gray-100"
                    onClick={() => router.push(`/sitter/booking-list/${booking.id}`)}
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
        </>
      )}
    </section>
  );
}
