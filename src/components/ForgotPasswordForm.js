"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { forgotPassword } from "@/lib/api";
import { errorToastClassNames, successToastClassNames } from "@/lib/toastStyles";

/**
 * ฟอร์มลืมรหัส (ticket 02)
 * flow: ใส่อีเมล → POST /api/auth/forgot-password → toast message จาก BE
 * ไม่บอกว่ามีบัญชีหรือไม่ — ใช้ข้อความกลางๆ ตามที่ BE ส่งมา
 */
export default function ForgotPasswordForm({ initialEmail = "", backHref = "/login/owner" }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const { message } = await forgotPassword({ email: email.trim() });
      // สำเร็จทั้งกรณีมี/ไม่มีบัญชี — โชว์ข้อความจาก BE ตาม handoff
      toast.success(message, { classNames: successToastClassNames });
      // พากลับ login หลังส่งคำขอแล้ว (ผู้ใช้ไปเช็คเมลต่อ)
      router.push(backHref);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not send reset link";
      toast(message, { classNames: errorToastClassNames });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
      <header className="flex flex-col items-center gap-1.5 text-center sm:gap-2">
        <h1 className="text-h2">Forgot password?</h1>
        <p className="text-body-2 text-gray-400">
          Enter your email and we&apos;ll send a reset link if an account exists.
        </p>
      </header>

      <label className="flex flex-col gap-2">
        <span className="text-body-3 font-bold text-black">Email</span>
        <input
          className="input"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="email@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <button className="btn btn-primary w-full" type="submit" disabled={loading}>
        {loading ? "Sending..." : "Send reset link"}
      </button>

      <p className="text-center text-body-3 text-gray-500">
        Remember your password?{" "}
        <Link href={backHref} className="font-bold text-primary">
          Back to Login
        </Link>
      </p>
    </form>
  );
}
