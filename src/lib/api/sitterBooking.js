/**
 * Sitter booking API — ticket T04
 * Confirm booking → PATCH waiting_service (BE capture Stripe ถ้าจ่ายด้วย card)
 */

import { apiFetch } from "@/lib/api";

/** HTTP 402 จาก BE เมื่อ Stripe capture ล้มเหลว */
export const PAYMENT_CAPTURE_FAILED_STATUS = 402;

/** UI ควรทำอะไรเมื่อ PATCH status error */
export const BOOKING_ERROR_ACTION = {
  LOGIN: "login",
  /** 402 — บัตรปฏิเสธ / capture ไม่ผ่าน แสดง message จาก BE */
  PAYMENT_CAPTURE_FAILED: "payment_capture_failed",
  MESSAGE: "message",
};

/**
 * แปลง HTTP status → action สำหรับ UI
 * 401 → login · 402 → payment capture failed · อื่นๆ → แสดง message
 */
export function getBookingStatusErrorAction(status) {
  if (status === 401) return BOOKING_ERROR_ACTION.LOGIN;
  if (status === PAYMENT_CAPTURE_FAILED_STATUS) {
    return BOOKING_ERROR_ACTION.PAYMENT_CAPTURE_FAILED;
  }
  return BOOKING_ERROR_ACTION.MESSAGE;
}

/** รวม action + message ให้หน้า booking detail ใช้ใน catch */
export function normalizeBookingStatusError(
  error,
  fallback = "Failed to update booking status",
) {
  const status = Number(error?.status) || 0;
  return {
    status,
    action: getBookingStatusErrorAction(status),
    message: error instanceof Error && error.message ? error.message : fallback,
  };
}

/** ดึงรายละเอียด booking ของ sitter */
export async function getSitterBooking(id) {
  const json = await apiFetch(
    `/api/sitters/bookings/${encodeURIComponent(id)}`,
  );
  return json.data ?? null;
}

/**
 * เปลี่ยนสถานะ booking — Confirm ใช้ waiting_service
 * BE จะ capture Stripe ตอน confirm (paymentMethod = stripe)
 */
export async function updateSitterBookingStatus(id, status) {
  const json = await apiFetch(
    `/api/sitters/bookings/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: { status },
    },
  );
  return json.data;
}
