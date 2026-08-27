"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import { errorToastClassNames } from "@/lib/toastStyles";
import SocialAuthButtons from "@/components/SocialAuthButtons";
import PasswordInput from "@/components/PasswordInput";

/** แปลง message จาก BE → ข้อความ toast (แยกอีเมล / รหัส) */
function getLoginToastMessage(message) {
  const lower = String(message).toLowerCase();

  if (lower.includes("email")) {
    return "Incorrect email";
  }
  if (lower.includes("password")) {
    return "Incorrect password";
  }
  return message || "Login failed";
}

// ฟอร์ม login ร่วม owner/sitter — หน้า page เป็นคนเปิด Remember / social
export default function LoginForm({
  title,
  subtitle,
  registerHref,
  registerPrompt,
  registerLabel = "Register",
  showRemember = false,
  showForgotPassword = false,
  showSocial = false,
  /** "owner" | "sitter" — ใช้ตอนกลับจาก /forgot-password */
  forgotPasswordFrom = "owner",
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  // ลิงก์ไป /forgot-password — พกอีเมลที่พิมพ์ไว้ (ถ้ามี)
  const forgotPasswordHref = (() => {
    const params = new URLSearchParams();
    const trimmed = email.trim();
    if (trimmed) params.set("email", trimmed);
    if (forgotPasswordFrom === "sitter") params.set("from", "sitter");
    const query = params.toString();
    return query ? `/forgot-password?${query}` : "/forgot-password";
  })();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const data = await login({ email, password });
      // ถ้าหน้าไม่มี Remember ให้ persist เสมอ
      saveAuth(data, showRemember ? remember : true);

      // Sitter → profile | Owner → homepage (อ่าน isSitter จาก API)
      const isSitter = Boolean(data?.user?.isSitter);
      router.push(isSitter ? "/sitter/profile" : "/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      // Toast มุมขวาล่าง — แยกอีเมลผิด / รหัสผิด ตาม message จาก BE
      toast(getLoginToastMessage(message), {
        classNames: errorToastClassNames,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
      <header className="flex flex-col items-center gap-1.5 text-center sm:gap-2">
        <h1 className="text-h2">{title}</h1>
        <p className="text-body-2 text-gray-400">{subtitle}</p>
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

      <div className="flex flex-col gap-2">
        <label htmlFor="login-password" className="text-body-3 font-bold text-black">
          Password
        </label>
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      {showRemember && showForgotPassword ? (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <label className="flex min-h-11 items-center gap-2 text-body-3 text-gray-500">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="size-4 shrink-0"
            />
            Remember?
          </label>
          {/* ticket 02: ไปหน้าขอลิงก์รีเซ็ต → POST /api/auth/forgot-password */}
          <Link
            href={forgotPasswordHref}
            className="inline-flex min-h-11 items-center text-body-3 font-medium text-primary"
          >
            Forget Password?
          </Link>
        </div>
      ) : null}

      {showForgotPassword && !showRemember ? (
        <p className="text-center">
          <Link
            href={forgotPasswordHref}
            className="inline-flex min-h-11 items-center text-body-3 font-medium text-primary"
          >
            Forget Password?
          </Link>
        </p>
      ) : null}

      <button className="btn btn-primary w-full" type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      {showSocial ? <SocialAuthButtons remember={showRemember ? remember : true} /> : null}

      <p className="text-center text-body-3 text-gray-500">
        {registerPrompt}{" "}
        <Link href={registerHref} className="font-bold text-primary">
          {registerLabel}
        </Link>
      </p>
    </form>
  );
}
