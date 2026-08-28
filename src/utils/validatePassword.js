/**
 * กฎความยาวรหัสผ่านร่วม (feat/login — Feedback Team)
 *
 * "More than 8 characters" = ผ่านเมื่อ length >= 9
 * ใช้ร่วมกันระหว่าง Register, Reset password (ticket 02) เพื่อไม่ให้ logic หลุดกัน
 */

/** ความยาวขั้นต่ำที่ HTML minLength ใช้ได้ (= มากกว่า 8 ตัว) */
export const PASSWORD_MIN_LENGTH = 9;

export const PASSWORD_LENGTH_ERROR_MESSAGE =
  "Password must be more than 8 characters";

/**
 * ตรวจรหัสผ่านก่อน submit
 * @returns {string|null} ข้อความ error หรือ null ถ้าผ่าน
 */
export function validatePassword(password) {
  if (!password) {
    return "Password is required";
  }

  if (password.length <= 8) {
    return PASSWORD_LENGTH_ERROR_MESSAGE;
  }

  return null;
}
