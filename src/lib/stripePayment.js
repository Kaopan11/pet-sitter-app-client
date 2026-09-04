/**
 * Stripe PaymentIntent status helpers — owner booking (manual capture / Q21=B)
 *
 * BE ใช้ capture_method: "manual" → หลัง owner จ่าย status = requires_capture
 * เงินถูก capture จริงตอน sitter Confirm (PATCH waiting_service)
 */

const AUTHORIZED_STATUSES = new Set([
  "requires_capture", // authorize สำเร็จ — รอ sitter confirm แล้ว BE capture
  "succeeded", // automatic capture หรือ capture แล้ว
  "processing", // กำลังประมวลผล (บาง payment method)
]);

/**
 * ตรวจว่า confirmPayment สำเร็จในมุม owner booking
 * @param {{ status?: string } | null | undefined} paymentIntent
 */
export function isStripePaymentAuthorized(paymentIntent) {
  const status = paymentIntent?.status;
  return typeof status === "string" && AUTHORIZED_STATUSES.has(status);
}
