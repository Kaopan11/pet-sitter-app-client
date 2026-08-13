"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import SocialAuthButtons from "@/components/SocialAuthButtons";

// ฟอร์ม login ใช้ร่วม owner / sitter — หน้าแต่ละ role ส่ง props คนละชุด
export default function LoginForm({
  title,
  subtitle,
  registerHref,
  registerPrompt,
  registerLabel = "Register",
  showRemember = false,
  showForgotPassword = false,
  showSocial = false,
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login({ email, password });
      // ถ้าหน้าไม่มี Remember ให้ persist เสมอ
      saveAuth(data, showRemember ? remember : true);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <header className="flex flex-col items-center gap-2 text-center">
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

      <label className="flex flex-col gap-2">
        <span className="text-body-3 font-bold text-black">Password</span>
        <input
          className="input"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>

      {showRemember && showForgotPassword ? (
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-body-3 text-gray-500">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            Remember?
          </label>
          {/* ยังไม่เชื่อม API forgot-password */}
          <button type="button" className="text-body-3 font-medium text-primary">
            Forget Password?
          </button>
        </div>
      ) : null}

      {showForgotPassword && !showRemember ? (
        <p className="text-center">
          <button type="button" className="text-body-3 font-medium text-primary">
            Forget Password?
          </button>
        </p>
      ) : null}

      {error ? <p className="text-center text-body-3 text-red">{error}</p> : null}

      <button className="btn btn-primary w-full" type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      {showSocial ? <SocialAuthButtons /> : null}

      <p className="text-center text-body-3 text-gray-500">
        {registerPrompt}{" "}
        <Link href={registerHref} className="font-bold text-primary">
          {registerLabel}
        </Link>
      </p>
    </form>
  );
}
