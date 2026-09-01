/**
 * Payout Option API (sitter) — ticket T01
 * BE branch: feat/sitter-payout-option
 *
 * UI ใช้ getPayoutErrorAction() ตัดสิน redirect / แสดง message
 */

import { apiFetch } from "@/lib/api";

/**
 * @typedef {{ code: string, name: string }} Bank
 *
 * @typedef {{
 *   bankCode: string,
 *   bankName: string,
 *   accountNumberMasked: string,
 *   accountName: string,
 *   bookBankImageUrl: string
 * }} BankAccount
 *
 * @typedef {{
 *   date: string,
 *   from: string,
 *   transactionNo: string,
 *   amount: number,
 *   bookingId: string,
 *   paymentMethod: "cash" | "stripe"
 * }} PayoutTransaction
 *
 * @typedef {{
 *   page: number,
 *   limit: number,
 *   totalItems: number
 * }} PayoutPagination
 *
 * @typedef {{
 *   totalEarning: number,
 *   bankAccount: BankAccount | null,
 *   transactions: PayoutTransaction[],
 *   pagination: PayoutPagination
 * }} PayoutDashboard
 *
 * @typedef {{
 *   bankCode: string,
 *   accountNumber: string,
 *   accountName: string,
 *   bookBankImageUrl: string
 * }} UpdateBankAccountBody
 */

/** UI ควรทำอะไรเมื่อ API error */
export const PAYOUT_ERROR_ACTION = {
  LOGIN: "login",
  FORBIDDEN: "forbidden",
  MESSAGE: "message",
};

/**
 * แปลง HTTP status → action สำหรับ UI
 * 401 → redirect login · 403 → forbidden · 400/402/500 → แสดง message
 */
export function getPayoutErrorAction(status) {
  if (status === 401) return PAYOUT_ERROR_ACTION.LOGIN;
  if (status === 403) return PAYOUT_ERROR_ACTION.FORBIDDEN;
  return PAYOUT_ERROR_ACTION.MESSAGE;
}

/** ดึง status จาก error ที่ apiFetch โยนมา */
export function getPayoutErrorStatus(error) {
  return Number(error?.status) || 0;
}

/** รวม action + message ให้หน้า UI ใช้ใน catch */
export function normalizePayoutError(error, fallback = "Request failed") {
  const status = getPayoutErrorStatus(error);
  return {
    status,
    action: getPayoutErrorAction(status),
    message: error instanceof Error && error.message ? error.message : fallback,
  };
}

/**
 * รายการธนาคาร — ไม่ต้อง login
 * @returns {Promise<Bank[]>}
 */
export async function getBanks() {
  const json = await apiFetch("/api/banks");
  return Array.isArray(json.data) ? json.data : [];
}

/**
 * Dashboard payout — total + bank card + transactions (paginated)
 * totalEarning มาจาก BE เท่านั้น (ไม่รวมฝั่ง FE)
 * @returns {Promise<PayoutDashboard>}
 */
export async function getMyPayout({ page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const json = await apiFetch(`/api/sitters/me/payout?${params.toString()}`);
  return json.data;
}

/**
 * ดึงบัญชีแยก (optional) — dashboard GET ส่ง bankAccount มาแล้ว
 * @returns {Promise<BankAccount | null>}
 */
export async function getMyPayoutBankAccount() {
  const json = await apiFetch("/api/sitters/me/payout/bank-account");
  return json.data ?? null;
}

/**
 * บันทึกบัญชีหลัง modal ยืนยัน
 * @param {UpdateBankAccountBody} body
 * @returns {Promise<BankAccount>}
 */
export async function updateMyPayoutBankAccount(body) {
  const json = await apiFetch("/api/sitters/me/payout/bank-account", {
    method: "PUT",
    body,
  });
  return json.data;
}

/**
 * อัปโหลดรูปสมุดบัญชี — field name ต้องตรง BE: bookBankImage
 * @returns {Promise<{ url: string }>}
 */
export async function uploadBookBankImage(file) {
  const formData = new FormData();
  formData.append("bookBankImage", file);

  const json = await apiFetch("/api/sitters/me/payout/book-bank-image", {
    method: "POST",
    body: formData,
  });
  return json.data;
}
