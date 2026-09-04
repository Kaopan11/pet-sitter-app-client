"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { completeOAuthProfile } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import {
  clearOAuthPendingToken,
  readOAuthPendingToken,
  readOAuthRemember,
} from "@/lib/supabase";
import { errorToastClassNames, successToastClassNames } from "@/lib/toastStyles";

/**
 * กรอกโปรไฟล์ครั้งแรกหลัง Social (ticket 05)
 *
 * flow:
 * 1) อ่าน access_token ที่ stash ไว้จาก /auth/callback (404 Profile incomplete)
 * 2) validate name/phone แบบเดียวกับ RegisterForm
 * 3) POST /api/auth/oauth/complete
 * 4) saveAuth → เข้าแอป (Owner / isSitter: false)
 */
export default function CompleteProfileForm({ loginHref = "/login/owner" }) {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState("");
  const [tokenStatus, setTokenStatus] = useState("loading"); // loading | ready | missing
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = readOAuthPendingToken();
    if (token) {
      setAccessToken(token);
      setTokenStatus("ready");
    } else {
      setTokenStatus("missing");
    }
  }, []);

  function validateForm() {
    const next = {};
    const trimmedName = name.trim();

    // Name / Phone — กติกาเดียวกับ RegisterForm
    if (!trimmedName) {
      next.name = "Name is required";
    } else if (trimmedName.length < 6 || trimmedName.length > 20) {
      next.name = "Name must be between 6 and 20 characters";
    }

    if (!phone.trim()) {
      next.phone = "Phone number is required";
    } else if (!/^0\d{9}$/.test(phone.trim())) {
      next.phone = "Phone number must be 10 digits and start with 0";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;
    if (!accessToken) {
      toast("Your social session expired. Please sign in again.", {
        classNames: errorToastClassNames,
      });
      router.replace(loginHref);
      return;
    }

    setLoading(true);
    try {
      const data = await completeOAuthProfile({
        accessToken,
        name: name.trim(),
        phone: phone.trim(),
      });

      const persist = readOAuthRemember(true);
      saveAuth(
        {
          token: data?.token || accessToken,
          user: data?.user ?? null,
        },
        persist,
      );
      clearOAuthPendingToken();

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-changed"));
      }

      toast.success("Welcome!", {
        classNames: successToastClassNames,
      });

      // Social complete สร้างเป็น Owner เสมอตาม BE
      const isSitter = Boolean(data?.user?.isSitter);
      router.replace(isSitter ? "/sitter/profile" : "/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not save profile";
      const status = err?.status;

      if (status === 409 || message.toLowerCase().includes("phone")) {
        setErrors((prev) => ({ ...prev, phone: message }));
      } else if (status === 401) {
        clearOAuthPendingToken();
        toast("Your social session expired. Please sign in again.", {
          classNames: errorToastClassNames,
        });
        router.replace(loginHref);
      } else if (message.toLowerCase().includes("name")) {
        setErrors((prev) => ({ ...prev, name: message }));
      } else {
        toast(message, { classNames: errorToastClassNames });
      }
    } finally {
      setLoading(false);
    }
  }

  if (tokenStatus === "loading") {
    return (
      <p className="text-center text-body-2 text-gray-500">Loading...</p>
    );
  }

  if (tokenStatus === "missing") {
    return (
      <div className="flex flex-col gap-5 sm:gap-6">
        <header className="flex flex-col items-center gap-1.5 text-center sm:gap-2">
          <h1 className="text-h2">Session required</h1>
          <p className="text-body-2 text-gray-400">
            Please sign in with Google or Facebook first.
          </p>
        </header>
        <Link href={loginHref} className="btn btn-primary w-full text-center">
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
      <header className="flex flex-col items-center gap-1.5 text-center sm:gap-2">
        <h1 className="text-h2">Complete your profile</h1>
        <p className="text-body-2 text-gray-400">
          Tell us your name and phone to finish social signup.
        </p>
      </header>

      <label className="flex flex-col gap-2">
        <span className="text-body-3 font-bold text-black">Name</span>
        <input
          className={`input ${errors.name ? "input-error" : ""}`}
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
        {errors.name ? (
          <p className="text-body-3 text-red">{errors.name}</p>
        ) : null}
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-body-3 font-bold text-black">Phone</span>
        <input
          className={`input ${errors.phone ? "input-error" : ""}`}
          type="tel"
          name="phone"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="Your phone number"
          maxLength={10}
          value={phone}
          onChange={(event) => {
            // เหมือน Register: รับแค่ตัวเลข สูงสุด 10 หลัก
            setPhone(event.target.value.replace(/\D/g, "").slice(0, 10));
            setErrors((prev) => ({ ...prev, phone: "" }));
          }}
        />
        {errors.phone ? (
          <p className="text-body-3 text-red">{errors.phone}</p>
        ) : null}
      </label>

      <button className="btn btn-primary w-full" type="submit" disabled={loading}>
        {loading ? "Saving..." : "Continue"}
      </button>

      <p className="text-center text-body-3 text-gray-500">
        <Link href={loginHref} className="font-bold text-primary">
          Back to Login
        </Link>
      </p>
    </form>
  );
}
