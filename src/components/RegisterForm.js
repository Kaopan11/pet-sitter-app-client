"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import SocialAuthButtons from "@/components/SocialAuthButtons";
import PasswordInput from "@/components/PasswordInput";

// หน้าสมัครเดียว — toggle Owner/Sitter ส่ง asSitter ให้ backend
export default function RegisterForm({
  title = "Join Us!",
  subtitle = "Find your perfect pet sitter with us",
  loginHref = "/login/owner",
  loginPrompt = "Already have an account?",
  loginLabel = "Login",
  initialMode = "owner",
}) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const asSitter = mode === "sitter";

  function getInputClassName(field) {
    return `input ${errors[field] ? "input-error" : ""}`;
  }

  /** แยก error จาก API ไปที่ฟิลด์ที่ถูกต้อง (email / phone) */
  function applyRegisterApiError(message) {
    const lower = message.toLowerCase();

    if (
      lower.includes("phone") ||
      message.includes("Phone number is already in use")
    ) {
      setErrors((prev) => ({ ...prev, phone: message }));
      return;
    }

    if (lower.includes("email")) {
      setErrors((prev) => ({ ...prev, email: message }));
      return;
    }

    if (lower.includes("name")) {
      setErrors((prev) => ({ ...prev, name: message }));
      return;
    }

    // error ทั่วไป — แสดงใต้ฟอร์ม
    setError(message);
  }

  function validateForm() {
    const newErrors = {};
    const trimmedName = name.trim();

    // Name: บังคับ + ความยาว 6–20 ตัว (นับหลัง trim)
    if (!trimmedName) {
      newErrors.name = "Name is required";
    } else if (trimmedName.length < 6 || trimmedName.length > 20) {
      newErrors.name = "Name must be between 6 and 20 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!email.includes("@") || !email.toLowerCase().includes(".com")) {
      newErrors.email = "Email must be a valid format and contain @ and .com";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^0\d{9}$/.test(phone.trim())) {
      newErrors.phone = "Phone number must be 10 digits and start with 0";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length <= 8) {
      newErrors.password = "Password must be more than 8 characters";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = await register({
        name: name.trim(),
        email,
        phone,
        password,
        asSitter,
      });
      saveAuth(data, true);
      // Sitter → หน้า profile | Owner → homepage
      router.push(asSitter ? "/sitter/profile" : "/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Register failed";
      applyRegisterApiError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
      <header className="flex flex-col items-center gap-1.5 text-center sm:gap-2">
        <h1 className="text-h2">{title}</h1>
        <p className="text-body-2 text-gray-400">{subtitle}</p>
      </header>

      <div
        className="mx-auto flex w-full max-w-none rounded-full bg-gray-100 p-1 sm:max-w-70"
        role="tablist"
        aria-label="Register as"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "owner"}
          className={`min-h-11 flex-1 rounded-full py-2 text-body-3 font-bold transition ${
            mode === "owner"
              ? "bg-white text-orange-500 ring-1 ring-orange-500"
              : "text-gray-400"
          }`}
          onClick={() => setMode("owner")}
        >
          Owner
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "sitter"}
          className={`min-h-11 flex-1 rounded-full py-2 text-body-3 font-bold transition ${
            mode === "sitter"
              ? "bg-white text-orange-500 ring-1 ring-orange-500"
              : "text-gray-400"
          }`}
          onClick={() => setMode("sitter")}
        >
          Sitter
        </button>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-body-3 font-bold text-black">Name</span>
        <input
          className={getInputClassName("name")}
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Your name"
          maxLength={20}
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setErrors((prev) => ({ ...prev, name: "" }));
          }}
        />
        {errors.name ? <p className="text-body-3 text-red">{errors.name}</p> : null}
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-body-3 font-bold text-black">Email</span>
        <input
          className={getInputClassName("email")}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="email@company.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setErrors((prev) => ({ ...prev, email: "" }));
          }}
        />
        {errors.email ? <p className="text-body-3 text-red">{errors.email}</p> : null}
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-body-3 font-bold text-black">Phone</span>
        <input
          className={getInputClassName("phone")}
          type="tel"
          name="phone"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="Your phone number"
          maxLength={10}
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value.replace(/\D/g, "").slice(0, 10));
            setErrors((prev) => ({ ...prev, phone: "" }));
            setError("");
          }}
        />
        {errors.phone ? <p className="text-body-3 text-red">{errors.phone}</p> : null}
      </label>

      <div className="flex flex-col gap-2">
        <label htmlFor="register-password" className="text-body-3 font-bold text-black">
          Password
        </label>
        <PasswordInput
          id="register-password"
          autoComplete="new-password"
          placeholder="Create your password"
          error={Boolean(errors.password)}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors((prev) => ({ ...prev, password: "" }));
          }}
        />
        {errors.password ? (
          <p className="text-body-3 text-red">{errors.password}</p>
        ) : null}
      </div>

      {error && !errors.email && !errors.phone ? (
        <p className="text-center text-body-3 text-red">{error}</p>
      ) : null}

      <button className="btn btn-primary w-full" type="submit" disabled={loading}>
        {loading
          ? "Registering..."
          : asSitter
            ? "Register as Sitter"
            : "Register as Owner"}
      </button>

      <SocialAuthButtons remember />

      <p className="text-center text-body-3 text-gray-500">
        {loginPrompt}{" "}
        <Link href={loginHref} className="font-bold text-primary">
          {loginLabel}
        </Link>
      </p>
    </form>
  );
}
