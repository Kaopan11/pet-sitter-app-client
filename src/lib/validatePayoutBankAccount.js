/** Validation + format สำหรับฟอร์มบัญชี payout — ticket T03b */

export const BANK_ACCOUNT_DIGIT_GROUPS = [5, 2, 3, 3];
export const BANK_ACCOUNT_MIN_DIGITS = 10;
export const BANK_ACCOUNT_MAX_DIGITS = 12;
/** ความยาวสูงสุดใน input รวม dash (12 หลัก → #####-##-###-##) */
export const BANK_ACCOUNT_INPUT_MAX_LENGTH = 15;

export const ACCOUNT_NAME_MIN_LENGTH = 2;
export const ACCOUNT_NAME_MAX_LENGTH = 100;

const ACCOUNT_NAME_PATTERN = /^[\p{L}\s]+$/u;

export const BANK_ACCOUNT_ERRORS = {
  required: "Bank account number is required",
  invalid: "Bank account number must be 10–12 digits",
};

export const ACCOUNT_NAME_ERRORS = {
  required: "Account name is required",
  length: "Account name must be 2–100 characters",
  lettersOnly: "Account name must contain letters only",
};

/** ดึงเฉพาะตัวเลขจากค่าที่มี dash */
export function stripBankAccountDigits(value) {
  return String(value ?? "").replace(/\D/g, "");
}

/** Format #####-##-###-### ขณะพิมพ์ (สูงสุด 12 หลัก) */
export function formatBankAccountNumberInput(raw) {
  const digits = stripBankAccountDigits(raw).slice(0, BANK_ACCOUNT_MAX_DIGITS);
  if (!digits) return "";

  const parts = [];
  let index = 0;

  for (const groupSize of BANK_ACCOUNT_DIGIT_GROUPS) {
    if (index >= digits.length) break;
    parts.push(digits.slice(index, index + groupSize));
    index += groupSize;
  }

  return parts.join("-");
}

/** validate เลขบัญชี — คืน error string หรือ "" */
export function validateBankAccountNumber(value) {
  const digits = stripBankAccountDigits(value);

  if (!digits) {
    return BANK_ACCOUNT_ERRORS.required;
  }

  if (
    digits.length < BANK_ACCOUNT_MIN_DIGITS ||
    digits.length > BANK_ACCOUNT_MAX_DIGITS
  ) {
    return BANK_ACCOUNT_ERRORS.invalid;
  }

  return "";
}

/** validate ชื่อบัญชี — คืน error string หรือ "" */
export function validateAccountName(value) {
  const trimmed = String(value ?? "").trim();

  if (!trimmed) {
    return ACCOUNT_NAME_ERRORS.required;
  }

  if (
    trimmed.length < ACCOUNT_NAME_MIN_LENGTH ||
    trimmed.length > ACCOUNT_NAME_MAX_LENGTH
  ) {
    return ACCOUNT_NAME_ERRORS.length;
  }

  if (!ACCOUNT_NAME_PATTERN.test(trimmed)) {
    return ACCOUNT_NAME_ERRORS.lettersOnly;
  }

  return "";
}

/** รวม validate ฟิลด์บัญชี (ใช้ใน validateForm) */
export function validatePayoutBankAccountFields({ accountNumber, accountName }) {
  const errors = {};

  const accountNumberError = validateBankAccountNumber(accountNumber);
  if (accountNumberError) {
    errors.accountNumber = accountNumberError;
  }

  const accountNameError = validateAccountName(accountName);
  if (accountNameError) {
    errors.accountName = accountNameError;
  }

  return errors;
}
