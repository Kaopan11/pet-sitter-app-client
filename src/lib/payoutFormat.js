/** Format helpers สำหรับหน้า Payout — แยกจาก API layer (T02) */

export function formatPayoutCurrency(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "0.00 THB";
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} THB`;
}

/** "2026-09-01" → "1 Sep, 2026" */
export function formatPayoutDate(isoDate) {
  if (!isoDate) return "—";
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  const formatted = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return formatted.replace(/^(\d+ \w+) (\d+)$/, "$1, $2");
}

/** bankAccount → "ไทยพาณิชย์ *444" หรือ null */
export function formatBankDisplay(bankAccount) {
  if (!bankAccount) return null;
  const name = String(bankAccount.bankName ?? "").trim();
  const masked = String(bankAccount.accountNumberMasked ?? "").trim();
  if (name && masked) return `${name} ${masked}`;
  return name || masked || null;
}
