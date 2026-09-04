"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, SquarePen, X, MapPin, Star } from "lucide-react";
import AccountSidebar from "../../../components/AccountSidebar";
import { getToken, getUser } from "@/lib/auth";
import { createConversation, getSitterAvailability, getSitters } from "@/lib/api";
import {
  formatBookingDurationFromRecord,
  formatBookingDateRangeFromRecord,
  isManyDayBookingRecord,
  normalizeBookedSlots,
  normalizeBookingDate,
  normalizeBookingTime,
} from "@/lib/booking";
import BookingDateTimeModal from "@/components/booking/BookingDateTimeModal";
import Pagination from "@/components/Pagination";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 5; // แสดง booking แค่ 5 การ์ดล่าสุดต่อหน้า ที่เหลือกดเปลี่ยนหน้าดูผ่าน Pagination

// สี/ข้อความของแต่ละสถานะ booking ใช้แสดง badge สถานะ
const STATUS_CONFIG = {
  waiting_confirm: { color: "#FA8AC0", label: "Waiting for confirm" },
  waiting_service: { color: "#F5A623", label: "Waiting for service" },
  in_service: { color: "#76D0FC", label: "In service" },
  success: { color: "#1CCD83", label: "Success" },
  cancelled: { color: "#EA1010", label: "Cancelled" },
};

// สีเส้นขอบตอน hover การ์ด booking แต่ละใบ ให้เข้าชุดกับสีของสถานะนั้นๆ
const HOVER_BORDER_CLASS = {
  waiting_confirm: "hover:border-[#FA8AC0]",
  waiting_service: "hover:border-[#F5A623]",
  in_service: "hover:border-[#76D0FC]",
  success: "hover:border-[#1CCD83]",
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ดึง sitter id ของ booking ออกมา โดยรับเฉพาะค่าที่เป็น UUID ที่ถูกต้องเท่านั้น
// (กันเคสที่ backend ส่งค่าอื่นที่ไม่ใช่ id จริงมาปนมาด้วย)
function bookingSitterId(booking) {
  const value =
    booking?.sitter?.id ??
    booking?.sitter_id ??
    booking?.sitter?.user_id ??
    booking?.sitterId;
  return UUID_PATTERN.test(String(value ?? "")) ? String(value) : "";
}

// เติม sitter id ที่ตรวจสอบแล้วกลับเข้าไปใน booking object เพื่อให้ใช้ id เดียวกันทั้งหน้า
function normalizeOwnerBooking(booking) {
  const sitterId = bookingSitterId(booking);
  return {
    ...booking,
    sitter: {
      ...(booking.sitter ?? {}),
      id: sitterId || booking.sitter?.id,
    },
    sitter_id: sitterId || booking.sitter_id,
  };
}

// กรณี booking ที่โหลดมาไม่มี sitter id ที่ใช้งานได้ (ข้อมูลเก่า/ไม่ครบ)
// ให้ดึงรายชื่อ sitter จริงมาจับคู่ด้วยชื่อ ถ้าจับคู่ไม่ได้ก็ fallback ไปใช้ตัวใดตัวหนึ่งแทน
// เพื่อให้ปุ่ม "Send Message"/"Call" ยังมี sitter id ไว้เปิดแชทได้
async function attachLiveSitterIds(bookings) {
  try {
    const { data } = await getSitters({ limit: 20 });
    if (!data?.length) return bookings.map(normalizeOwnerBooking);

    return bookings.map((booking, index) => {
      if (bookingSitterId(booking)) return normalizeOwnerBooking(booking);

      const name = String(booking.sitter?.name ?? "").trim().toLowerCase();
      const match =
        data.find((sitter) => {
          const title = String(sitter.title ?? sitter.display_name ?? sitter.sitter_name ?? "")
            .trim()
            .toLowerCase();
          return name && title === name;
        }) ?? data[index % data.length];

      return normalizeOwnerBooking({
        ...booking,
        sitter: {
          ...(booking.sitter ?? {}),
          id: match.id,
        },
        sitter_id: match.id,
      });
    });
  } catch {
    // ถ้าดึงรายชื่อ sitter ไม่สำเร็จ ให้ใช้ข้อมูล booking เดิมไปก่อน ไม่ให้หน้าพัง
    return bookings.map(normalizeOwnerBooking);
  }
}

export default function BookingHistoryPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null); // booking ที่กำลังเปิดดู modal รายละเอียด
  const [reviewBooking, setReviewBooking] = useState(null); // booking ที่กำลังเขียนรีวิวอยู่
  const [viewReviewBooking, setViewReviewBooking] = useState(null); // booking ที่กำลังดูรีวิวที่เคยเขียนไว้
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0); // ดาวที่ชี้เมาส์ค้างอยู่ ใช้ทำ preview ก่อนกดเลือกจริง
  const [reviewText, setReviewText] = useState("");
  const [reportBooking, setReportBooking] = useState(null); // booking ที่กำลังจะแจ้งปัญหา (report)
  const [reportSubject, setReportSubject] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [cancelBooking, setCancelBooking] = useState(null); // booking ที่กำลังจะยกเลิก (แสดง modal ยืนยัน)
  const [isCancelling, setIsCancelling] = useState(false);
  const [changeDateBooking, setChangeDateBooking] = useState(null); // booking ที่กำลังเปลี่ยนวันที่/เวลา
  const [changeForm, setChangeForm] = useState({
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
  });
  const [changeInitialMode, setChangeInitialMode] = useState("one"); // โหมดเริ่มต้นของ modal เปลี่ยนวันที่: "one" วันเดียว หรือ "many" หลายวัน
  const [changeBookedSlots, setChangeBookedSlots] = useState([]); // ช่วงเวลาที่ sitter ถูกจองไปแล้ว ใช้กันไม่ให้เลือกวันซ้ำ
  const [isSavingDate, setIsSavingDate] = useState(false);

  // โหลดรายการ booking ทั้งหมดของเจ้าของสัตว์เลี้ยงคนนี้เมื่อเปิดหน้า
  useEffect(() => {
    let cancelled = false; // กันการ setState หลัง component ถูก unmount ไปแล้ว (เช่น เปลี่ยนหน้าเร็วระหว่างรอ fetch)

    async function loadBookings() {
      if (!getToken()) {
        router.replace("/login/owner");
        return;
      }

      setIsLoading(true);
      try {
        const token = getToken();
        const res = await fetch(
          `${API_URL}/api/bookings/owner?page=${currentPage}&limit=${PAGE_SIZE}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            router.replace("/login/owner");
            return;
          }
          throw new Error(json.message || "Failed to load bookings");
        }

        const rows = (json.data || []).map(normalizeOwnerBooking);
        // ถ้ามี booking ไหนไม่มี sitter id ที่ใช้งานได้ ค่อยไปดึงรายชื่อ sitter มาจับคู่เพิ่ม (ลดการยิง API โดยไม่จำเป็น)
        const next = rows.some((booking) => !bookingSitterId(booking))
          ? await attachLiveSitterIds(rows)
          : rows;
        if (!cancelled) {
          setBookings(next);
          setTotalPages(json.totalPages ?? 1);
          setLoadError("");
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error.message || "Failed to load bookings");
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
  }, [router, currentPage]);

  // เปลี่ยนหน้า booking history (จาก Pagination component ด้านล่างรายการ)
  const goToPage = (page) => {
    setCurrentPage((prev) => {
      const clamped = Math.min(Math.max(1, page), Math.max(1, totalPages));
      return clamped === prev ? prev : clamped;
    });
  };

  // เปิดหน้าแชทกับ pet sitter ของ booking นี้ (สร้างห้องสนทนาใหม่ถ้ายังไม่มี)
  async function openSitterChat(event, booking) {
    event.stopPropagation(); // กันไม่ให้คลิกทะลุไปเปิด modal รายละเอียด booking ที่อยู่ข้างหลัง
    const sitterId = bookingSitterId(booking);

    if (!sitterId) {
      toast.error("Cannot open chat: this booking has no pet sitter");
      return;
    }

    try {
      const conversation = await createConversation(sitterId);
      router.push(`/messages?id=${conversation.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start chat");
    }
  }

  // แสดง badge จุดสี + ข้อความสถานะของ booking
  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.waiting_confirm;
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

  const formatTimestampTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ticket 04: many days = ช่วงวัน · one day = วัน | เวลา
  function formatHistoryDateTime(booking) {
    if (isManyDayBookingRecord(booking)) {
      return formatBookingDateRangeFromRecord(booking);
    }
    return `${formatDate(booking.start_date)} | ${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}`;
  }

  // ticket 04: หัวการ์ด "Booking date" — many days แสดงช่วง
  function formatHistoryBookingDate(booking) {
    if (isManyDayBookingRecord(booking)) {
      return formatBookingDateRangeFromRecord(booking);
    }
    return formatDate(booking.start_date);
  }

  // เปิด modal เขียนรีวิว โดยรีเซ็ตค่าดาว/ข้อความให้ว่างทุกครั้ง
  const openReviewModal = (booking) => {
    setRating(0);
    setHoverRating(0);
    setReviewText("");
    setReviewBooking(booking);
  };

  const closeReviewModal = () => {
    setReviewBooking(null);
    setRating(0);
    setHoverRating(0);
    setReviewText("");
  };

  // ส่งคะแนน + รีวิวไปบันทึก แล้วอัปเดตข้อมูล review ของ booking นั้นในหน้าจอทันที
  const handleSubmitReview = async () => {
    if (!reviewBooking) return;
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      const token = getToken();
      const res = await fetch(
        `${API_URL}/api/bookings/owner/${reviewBooking.id}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating, text: reviewText }),
        }
      );

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || "Failed to submit review");
      }

      setBookings((prev) =>
        prev.map((b) =>
          b.id === reviewBooking.id ? { ...b, review: json.data } : b
        )
      );

      toast.success("Review submitted");
      closeReviewModal();
    } catch (error) {
      toast.error(error.message || "Failed to submit review");
    }
  };

  const openCancelModal = (booking) => {
    setCancelBooking(booking);
  };

  const closeCancelModal = () => {
    if (isCancelling) return;
    setCancelBooking(null);
  };

  // ยืนยันยกเลิก booking แล้วอัปเดตสถานะในรายการเป็น "cancelled" โดยไม่ต้องโหลดหน้าใหม่
  const handleConfirmCancel = async () => {
    if (!cancelBooking) return;

    setIsCancelling(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${API_URL}/api/bookings/owner/${cancelBooking.id}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || "Failed to cancel booking");
      }

      setBookings((prev) =>
        prev.map((b) =>
          b.id === cancelBooking.id ? { ...b, status: "cancelled" } : b
        )
      );

      toast.success("Booking cancelled");
      setCancelBooking(null);
    } catch (error) {
      toast.error(error.message || "Failed to cancel booking");
    } finally {
      setIsCancelling(false);
    }
  };

  // ticket 05: Change date — reuse the exact Book Now modal (one day / many days, date + time)
  async function openChangeDateModal(booking) {
    const startDate = normalizeBookingDate(booking.start_date);
    const endDate = normalizeBookingDate(booking.end_date) || startDate;
    const isManyDay = isManyDayBookingRecord(booking);

    setChangeDateBooking(booking);
    setChangeInitialMode(isManyDay ? "many" : "one");
    setChangeForm({
      startDate,
      endDate: isManyDay ? endDate : startDate,
      startTime: isManyDay ? "" : normalizeBookingTime(booking.start_time),
      endTime: isManyDay ? "" : normalizeBookingTime(booking.end_time),
    });
    setChangeBookedSlots([]);

    const sitterId = bookingSitterId(booking);
    if (!sitterId) return;

    try {
      const data = await getSitterAvailability(sitterId);
      // ตัดช่วงวันเดิมของ booking นี้ออกจากคิววันที่ถูกจองแล้ว เพื่อไม่ให้ modal มองว่าวันเดิมของตัวเองถูกจับจอง
      const slots = normalizeBookedSlots(data).filter(
        (slot) => !(slot.date >= startDate && slot.date <= endDate)
      );
      setChangeBookedSlots(slots);
    } catch {
      setChangeBookedSlots([]);
    }
  }

  function closeChangeDateModal() {
    if (isSavingDate) return;
    setChangeDateBooking(null);
    setChangeForm({ startDate: "", endDate: "", startTime: "", endTime: "" });
    setChangeBookedSlots([]);
  }

  function handleChangeFormChange(patch) {
    setChangeForm((current) => ({ ...current, ...patch }));
  }

  // บันทึกวันที่/เวลาใหม่ของ booking (reschedule) แล้ว sync ค่าใหม่กลับเข้าทั้งรายการและ modal รายละเอียดที่เปิดอยู่
  const handleSaveDate = async () => {
    if (!changeDateBooking) return;

    const { startDate, endDate, startTime, endTime } = changeForm;
    // จองหลายวันไม่มีเวลาเริ่ม/สิ้นสุดแบบวันเดียว จึงไม่ส่ง startTime/endTime ไปกับ request
    const isManyDay = Boolean(endDate && endDate > startDate);

    setIsSavingDate(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${API_URL}/api/bookings/owner/${changeDateBooking.id}/reschedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            startDate,
            endDate: endDate || startDate,
            ...(isManyDay ? {} : { startTime, endTime }),
          }),
        }
      );

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || "Failed to change booking date");
      }

      const updated = json.data || {};
      const patch = {
        start_date: updated.start_date ?? startDate,
        end_date: updated.end_date ?? (endDate || startDate),
        start_time: isManyDay ? null : (updated.start_time ?? startTime),
        end_time: isManyDay ? null : (updated.end_time ?? endTime),
        ...(updated.duration != null ? { duration: updated.duration } : {}),
        ...(updated.duration_unit != null ? { duration_unit: updated.duration_unit } : {}),
        ...(updated.total_price != null ? { total_price: updated.total_price } : {}),
      };

      setBookings((prev) =>
        prev.map((b) => (b.id === changeDateBooking.id ? { ...b, ...patch } : b))
      );
      setSelectedBooking((prev) =>
        prev && prev.id === changeDateBooking.id ? { ...prev, ...patch } : prev
      );

      toast.success("Booking date updated");
      closeChangeDateModal();
    } catch (error) {
      toast.error(error.message || "Failed to change booking date");
    } finally {
      setIsSavingDate(false);
    }
  };

  const openReportModal = (booking) => {
    setReportSubject("");
    setReportDescription("");
    setReportBooking(booking);
  };

  const closeReportModal = () => {
    setReportBooking(null);
    setReportSubject("");
    setReportDescription("");
  };

  // ส่งแบบฟอร์มแจ้งปัญหา (report) เกี่ยวกับ booking นี้ไปให้แอดมิน
  const handleSubmitReport = async () => {
    if (!reportBooking) return;
    if (!reportSubject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    try {
      const token = getToken();
      const res = await fetch(
        `${API_URL}/api/bookings/owner/${reportBooking.id}/report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subject: reportSubject,
            description: reportDescription,
          }),
        }
      );

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || "Failed to submit report");
      }

      toast.success("Report submitted");
      closeReportModal();
    } catch (error) {
      toast.error(error.message || "Failed to submit report");
    }
  };

  return (
    <div className="flex min-h-full bg-gray-100">
      <div className="mx-4 mt-6 flex w-full min-w-0 flex-col gap-4 pb-8 sm:mx-6 lg:mx-10 lg:flex-row lg:justify-center lg:gap-0">
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
                  className={`w-full bg-white flex flex-col p-4 sm:p-6 cursor-pointer border border-[#DCDFED] transition-colors ${
                    HOVER_BORDER_CLASS[booking.status] || ""
                  }`}
                  style={{ borderRadius: "16px" }}
                >
                  {/* หัวการ์ด: ข้อมูล sitter + วันที่จอง + badge สถานะ */}
                  <div
                    className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                    style={{ borderBottom: "1px solid #DCDFED", paddingBottom: "16px", marginBottom: "16px" }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative size-14 sm:size-16 overflow-hidden rounded-full bg-gray-200 shrink-0">
                        {booking.sitter_avatar_url ? (
                          <img
                            src={booking.sitter_avatar_url}
                            alt={booking.sitter_name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="size-full bg-gray-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3
                          className="text-h3 wrap-break-word"
                          style={{ color: "#000000", fontSize: "clamp(1.125rem, 4vw, 1.5rem)" }}
                        >
                          {booking.sitter_name || "Unknown"}
                        </h3>
                      </div>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <p className="mb-2 text-body-3" style={{ color: "#AEB1C3" }}>
                        Booking date: {formatHistoryBookingDate(booking)}
                      </p>
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>

                  {/* แถวรายละเอียดการจอง: วันที่-เวลา / ระยะเวลา / สัตว์เลี้ยง */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-0" style={{ marginBottom: "24px" }}>
                    <div className="flex flex-col sm:pr-6 sm:border-r" style={{ borderColor: "#DCDFED" }}>
                      <span className="text-body-3 mb-1" style={{ color: "#7B7E8F" }}>
                        Date & Time:
                      </span>
                      <span className="flex flex-wrap items-center gap-2 text-body-2" style={{ color: "#3A3B46" }}>
                        {formatHistoryDateTime(booking)}
                        {booking.status === "waiting_confirm" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); openChangeDateModal(booking); }}
                            className="inline-flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity text-body-2"
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
                        {formatBookingDurationFromRecord(booking)}
                      </span>
                    </div>

                    <div className="flex flex-col sm:pl-6">
                      <span className="text-body-3 mb-1" style={{ color: "#7B7E8F" }}>
                        Pet:
                      </span>
                      <span className="text-body-2" style={{ color: "#3A3B46" }}>
                        {booking.pet_names || "-"}
                      </span>
                    </div>
                  </div>

                  {/* กล่องข้อความสถานะพร้อมปุ่ม action — เนื้อหาและปุ่มจะเปลี่ยนไปตาม booking.status */}
                  <div>
                    {/* สถานะ: รอ sitter ยืนยันการจอง — แสดงปุ่มยกเลิก/ส่งข้อความ/โทร */}
                    {booking.status === "waiting_confirm" && (
                      <div
                        className="w-full flex flex-col items-stretch sm:flex-row sm:items-center sm:justify-between"
                        style={{ backgroundColor: "#F6F6F9", padding: "16px", borderRadius: "8px", gap: "16px", minHeight: "80px", boxSizing: "border-box" }}
                      >
                        <span className="text-body-3" style={{ color: "#7B7E8F" }}>
                          Waiting Pet Sitter for confirm booking
                        </span>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); openCancelModal(booking); }}
                            className="btn btn-ghost shrink-0"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={(e) => openSitterChat(e, booking)}
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
                    {/* สถานะ: sitter ยืนยันการจองแล้ว — แสดงปุ่มส่งข้อความ/โทร (ไม่มีปุ่มยกเลิก) */}
                    {booking.status === "confirmed" && (
                      <div
                        className="w-full flex flex-col items-stretch sm:flex-row sm:items-center sm:justify-between"
                        style={{ backgroundColor: "#F6F6F9", padding: "16px", borderRadius: "8px", gap: "16px", minHeight: "80px", boxSizing: "border-box" }}
                      >
                        <span className="text-body-3" style={{ color: "#7B7E8F" }}>
                          Pet Sitter has confirmed your booking
                        </span>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => openSitterChat(e, booking)}
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
                    {/* สถานะ: รอถึงวันเริ่มบริการ */}
                    {booking.status === "waiting_service" && (
                      <div
                        className="w-full flex flex-col items-stretch sm:flex-row sm:items-center sm:justify-between"
                        style={{ backgroundColor: "#F6F6F9", padding: "16px", gap: "16px", borderRadius: "8px", minHeight: "80px", boxSizing: "border-box" }}
                      >
                        <span className="text-body-3" style={{ color: "#7B7E8F" }}>
                          Booking confirmed, waiting for service to start
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
                    {/* สถานะ: กำลังรับบริการอยู่ */}
                    {booking.status === "in_service" && (
                      <div
                        className="w-full flex flex-col items-stretch sm:flex-row sm:items-center sm:justify-between"
                        style={{ backgroundColor: "#F6F6F9", padding: "16px", gap: "16px", borderRadius: "8px", boxSizing: "border-box" }}
                      >
                        <span className="text-body-3" style={{ color: "#7B7E8F" }}>
                          Your pet is already in Pet Sitter care!
                        </span>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => openSitterChat(e, booking)}
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
                    {/* สถานะ: บริการเสร็จสิ้นแล้ว — แจ้งปัญหาได้ และเขียน/ดูรีวิวได้ */}
                    {booking.status === "success" && (
                      <div
                        className="w-full flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between"
                        style={{ backgroundColor: "#E7FDF4", padding: "16px", borderRadius: "8px", minHeight: "80px", boxSizing: "border-box" }}
                      >
                        <div className="flex flex-col">
                          <span className="text-body-3" style={{ color: "#1CCD83" }}>
                            Success date:
                          </span>
                          <span className="text-body-3" style={{ color: "#1CCD83" }}>
                            {formatDate(booking.updated_at)} | {formatTimestampTime(booking.updated_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); openReportModal(booking); }}
                            className="btn btn-ghost shrink-0"
                          >
                            Report
                          </button>
                          {booking.review ? (
                            // เคยรีวิวไว้แล้ว — กดเพื่อดูรีวิวเดิม แทนที่จะเขียนใหม่
                            <button
                              onClick={(e) => { e.stopPropagation(); setViewReviewBooking(booking); }}
                              className="btn btn-secondary flex-1 sm:flex-none"
                              style={{ minWidth: "120px" }}
                            >
                              Your Review
                            </button>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); openReviewModal(booking); }}
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

          {!isLoading && bookings.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal รายละเอียด booking — เปิดเมื่อคลิกที่การ์ด แสดงข้อมูลครบพร้อม action เปลี่ยนวันที่ */}
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
            {/* หัวข้อ Modal */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #DCDFED" }}>
              <h3 className="text-h3" style={{ color: "#3A3B46" }}>
                Booking Detail
              </h3>
              <button onClick={() => setSelectedBooking(null)} aria-label="Close" className="cursor-pointer hover:opacity-70 transition-opacity">
                <X className="size-5" style={{ color: "#3A3B46" }} />
              </button>
            </div>

            {/* เนื้อหา Modal */}
            <div className="flex flex-col gap-4 px-6 py-5">
              {getStatusBadge(selectedBooking.status)}

              <div className="flex flex-col gap-1">
                <p className="text-body-3" style={{ color: "#AEB1C3" }}>
                  Booking date: {formatHistoryBookingDate(selectedBooking)}
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
                    {selectedBooking.sitter_name}
                  </span>
                </div>
                <button
                  onClick={() => toast.info("Map feature coming soon")}
                  className="inline-flex items-center gap-1 shrink-0 cursor-pointer hover:opacity-80 transition-opacity text-body-2"
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
                    {formatHistoryDateTime(selectedBooking)}
                  </span>
                </div>
                {selectedBooking.status === "waiting_confirm" && (
                  <button
                    onClick={() => openChangeDateModal(selectedBooking)}
                    className="inline-flex items-center gap-1 shrink-0 cursor-pointer hover:opacity-80 transition-opacity text-body-2"
                    style={{ color: "#FF7037", fontWeight: 700, textAlign: "center" }}
                  >
                    <SquarePen style={{ width: "20.01px", height: "20.01px", color: "#FF7037" }} />
                    Change
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-body-3" style={{ color: "#7B7E8F" }}>Duration:</span>
                <span className="text-body-2" style={{ color: "#3A3B46", fontWeight: 700 }}>{formatBookingDurationFromRecord(selectedBooking)}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-body-3" style={{ color: "#7B7E8F" }}>Pet:</span>
                <span className="text-body-2" style={{ color: "#3A3B46" }}>{selectedBooking.pet_names || "-"}</span>
              </div>
            </div>

            {/* ท้าย Modal: ยอดรวมราคา */}
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
                {selectedBooking.total_price ? `${selectedBooking.total_price} THB` : "-"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal เขียนรีวิว — เปิดจากปุ่ม "Review" ในสถานะ success */}
      {reviewBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeReviewModal}
        >
          <div
            className="w-full flex flex-col bg-white font-sans"
            style={{
              maxWidth: "800px",
              maxHeight: "800px",
              overflowY: "auto",
              borderRadius: "16px",
              boxShadow: "0px 4px 24px 0px rgba(0, 0, 0, 0.04)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* หัวข้อ */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #DCDFED" }}>
              <h3 className="text-h3" style={{ color: "#3A3B46" }}>Rating &amp; Review</h3>
              <button onClick={closeReviewModal} aria-label="Close" className="cursor-pointer hover:opacity-70 transition-opacity">
                <X className="size-5" style={{ color: "#3A3B46" }} />
              </button>
            </div>

            {/* เนื้อหา */}
            <div className="flex flex-col items-center gap-6 px-6 py-8">
              <div className="flex flex-col items-center gap-4">
                <span className="text-body-1" style={{ color: "#000000", fontWeight: 700 }}>What is your rate?</span>
                <div className="flex items-center gap-2">
                  {/* ดาว 5 ดวง — hover เพื่อ preview ก่อนคลิกเลือกคะแนนจริงด้วย setRating */}
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`Rate ${star} star`}
                      className="cursor-pointer"
                    >
                      <Star
                        className="size-8"
                        style={{
                          color: (hoverRating || rating) >= star ? "#1CCD83" : "#DCDFED",
                          fill: (hoverRating || rating) >= star ? "#1CCD83" : "#DCDFED"
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex w-full flex-col items-center gap-3">
                <span className="text-body-1" style={{ color: "#000000", fontWeight: 700 }}>Share more about your experience</span>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Your review..."
                  rows={5}
                  className="w-full resize-none text-body-2"
                  style={{ color: "#000000", border: "1px solid #DCDFED", borderRadius: "8px", padding: "12px", outline: "none" }}
                />
              </div>
            </div>

            {/* ท้าย Modal */}
            <div className="flex items-center justify-between px-6 pb-6">
              <button onClick={closeReviewModal} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleSubmitReview} className="btn btn-primary">
                Send Review&amp;Rating
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ดูรีวิวที่เคยเขียนไว้แล้ว — เปิดจากปุ่ม "Your Review" */}
      {viewReviewBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setViewReviewBooking(null)}
        >
          <div
            className="w-full flex flex-col bg-white font-sans"
            style={{
              maxWidth: "800px",
              maxHeight: "600px",
              overflowY: "auto",
              borderRadius: "16px",
              boxShadow: "0px 4px 24px 0px rgba(0, 0, 0, 0.04)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* หัวข้อ */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #DCDFED" }}>
              <h3 className="text-h3" style={{ color: "#3A3B46" }}>Your Rating and Review</h3>
              <button onClick={() => setViewReviewBooking(null)} aria-label="Close" className="cursor-pointer hover:opacity-70 transition-opacity">
                <X className="size-5" style={{ color: "#3A3B46" }} />
              </button>
            </div>

            {/* เนื้อหา */}
            <div className="flex flex-col gap-4 px-6 py-6">
              <div className="flex items-center justify-between gap-3" style={{ paddingBottom: "16px", borderBottom: "1px solid #DCDFED" }}>
                <div className="flex items-center gap-3">
                  <div className="relative size-12 overflow-hidden rounded-full bg-gray-200 shrink-0">
                    {getUser()?.avatarUrl || getUser()?.avatar_url ? (
                      <img
                        src={getUser()?.avatarUrl || getUser()?.avatar_url}
                        alt={getUser()?.name || "You"}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="size-full bg-gray-300" />
                    )}
                  </div>
                  <div>
                    <p className="text-body-2" style={{ color: "#000000", fontWeight: 700 }}>
                      {getUser()?.name || "You"}
                    </p>
                    <p className="text-body-3" style={{ color: "#AEB1C3" }}>
                      {formatDate(viewReviewBooking.review?.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="size-5"
                      style={{
                        color: (viewReviewBooking.review?.rating || 0) >= star ? "#1CCD83" : "#DCDFED",
                        fill: (viewReviewBooking.review?.rating || 0) >= star ? "#1CCD83" : "#DCDFED"
                      }}
                    />
                  ))}
                </div>
              </div>

              {viewReviewBooking.review?.text && (
                <p className="text-body-2" style={{ color: "#3A3B46" }}>
                  {viewReviewBooking.review.text}
                </p>
              )}
            </div>

            {/* ท้าย Modal */}
            <div className="flex items-center justify-center px-6 pb-6">
              <button
                onClick={() => toast.info("View Pet Sitter feature coming soon")}
                className="btn btn-secondary"
              >
                View Pet Sitter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal แจ้งปัญหา (Report) — เปิดจากปุ่ม "Report" ในสถานะ success */}
      {reportBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeReportModal}
        >
          <div
            className="w-full flex flex-col bg-white font-sans"
            style={{
              maxWidth: "800px",
              maxHeight: "800px",
              overflowY: "auto",
              borderRadius: "16px",
              boxShadow: "0px 4px 24px 0px rgba(0, 0, 0, 0.04)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* หัวข้อ */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #DCDFED" }}>
              <h3 className="text-h3" style={{ color: "#3A3B46" }}>Report</h3>
              <button onClick={closeReportModal} aria-label="Close" className="cursor-pointer hover:opacity-70 transition-opacity">
                <X className="size-5" style={{ color: "#3A3B46" }} />
              </button>
            </div>

            {/* เนื้อหา */}
            <div className="flex flex-col gap-4 px-6 py-5">
              <div className="flex flex-col gap-2">
                <span className="text-body-2" style={{ color: "#000000", fontWeight: 500 }}>Issue</span>
                <input
                  type="text"
                  value={reportSubject}
                  onChange={(e) => setReportSubject(e.target.value)}
                  placeholder="Subject"
                  className="w-full text-body-2"
                  style={{ color: "#000000", border: "1px solid #DCDFED", borderRadius: "8px", padding: "12px 16px", outline: "none" }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-body-2" style={{ color: "#000000", fontWeight: 500 }}>Description</span>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Describe detail..."
                  rows={5}
                  className="w-full resize-none text-body-2"
                  style={{ color: "#000000", border: "1px solid #DCDFED", borderRadius: "8px", padding: "12px", outline: "none" }}
                />
              </div>
            </div>

            {/* ท้าย Modal */}
            <div className="flex items-center justify-between px-6 pb-6" style={{ marginTop: "auto" }}>
              <button onClick={closeReportModal} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleSubmitReport} className="btn btn-primary">
                Send Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ยืนยันการยกเลิก booking */}
      {cancelBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeCancelModal}
        >
          <div
            className="w-full flex flex-col bg-white font-sans"
            style={{
              maxWidth: "480px",
              borderRadius: "16px",
              boxShadow: "0px 4px 24px 0px rgba(0, 0, 0, 0.04)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* หัวข้อ */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #DCDFED" }}>
              <h3 className="text-h3" style={{ color: "#3A3B46" }}>Cancel Booking</h3>
              <button onClick={closeCancelModal} disabled={isCancelling} aria-label="Close" className="cursor-pointer hover:opacity-70 transition-opacity">
                <X className="size-5" style={{ color: "#3A3B46" }} />
              </button>
            </div>

            {/* เนื้อหา */}
            <div className="px-6 py-6">
              <p className="text-body-2" style={{ color: "#3A3B46" }}>
                Are you sure you want to cancel this booking with{" "}
                {cancelBooking.sitter_name || "this pet sitter"}?
              </p>
            </div>

            {/* ท้าย Modal */}
            <div className="flex items-center justify-between px-6 pb-6" style={{ gap: "16px" }}>
              <button onClick={closeCancelModal} disabled={isCancelling} className="btn btn-secondary flex-1">
                Keep Booking
              </button>
              <button onClick={handleConfirmCancel} disabled={isCancelling} className="btn btn-primary flex-1">
                {isCancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal เปลี่ยนวันที่ booking — ใช้ modal ตัวเดียวกับตอน Book Now (รองรับทั้งจองวันเดียวและหลายวัน) */}
      {changeDateBooking && (
        <BookingDateTimeModal
          startDate={changeForm.startDate}
          endDate={changeForm.endDate}
          startTime={changeForm.startTime}
          endTime={changeForm.endTime}
          bookedSlots={changeBookedSlots}
          onChange={handleChangeFormChange}
          onClose={closeChangeDateModal}
          onContinue={handleSaveDate}
          initialDateMode={changeInitialMode}
          title="Change Booking Date"
          description={(isManyDays) =>
            changeDateBooking.sitter_name
              ? `Pick a new date${isManyDays ? "" : " and time"} for your booking with ${changeDateBooking.sitter_name}.`
              : `Pick a new date${isManyDays ? "" : " and time"} for your booking.`
          }
          submitLabel="Confirm change"
          submitting={isSavingDate}
          closeDisabled={isSavingDate}
        />
      )}
    </div>
  );
}
