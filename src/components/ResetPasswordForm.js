"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { resetPassword } from "@/lib/api";
import {
  clearStashedRecoveryToken,
  resolveRecoveryAccessToken,
} from "@/lib/supabase";
import PasswordInput from "@/components/PasswordInput";
import { errorToastClassNames, successToastClassNames } from "@/lib/toastStyles";

/** กฎเดียวกับ handoff BE — รหัสใหม่ ≥ 6 ตัว */
const MIN_PASSWORD_LENGTH = 6;

/**
 * ฟอร์มตั้งรหัสใหม่จากลิงก์ในเมล (ticket 03)
 *
 * flow:
 * 1) เปิด /reset-password#access_token=...
 * 2) อ่าน token จาก hash ก่อน (ไม่บังคับรอ Supabase env)
 * 3) POST /api/auth/reset-password
 * 4) สำเร็จ → ไป Login (ไม่ auto-login, ไม่ saveAuth)
 */
export default function ResetPasswordForm({ loginHref = "/login/owner" }) {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState("");
  const [tokenStatus, setTokenStatus] = useState("loading"); // loading | ready | missing
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadToken() {
      // ไม่ gate ด้วย isSupabaseConfigured — hash ในเมลใช้ส่ง BE ได้เลย
      try {
        const token = await resolveRecoveryAccessToken();
        if (cancelled) return;

        if (token) {
          setAccessToken(token);
          setTokenStatus("ready");
          // ล้าง hash หลัง stash ใน sessionStorage แล้ว (กันโผล่ใน history)
          if (window.location.hash) {
            window.history.replaceState(
              null,
              "",
              `${window.location.pathname}${window.location.search}`,
            );
          }
        } else {
          setTokenStatus("missing");
        }
      } catch {
        if (!cancelled) setTokenStatus("missing");
      }
    }

    loadToken();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setFieldError("");

    if (password.length < MIN_PASSWORD_LENGTH) {
      setFieldError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    if (password !== confirmPassword) {
      setFieldError("Passwords do not match");
      return;
    }
    if (!accessToken) {
      toast("This reset link is invalid or has expired. Please request a new one.", {
        classNames: errorToastClassNames,
      });
      return;
    }

    setLoading(true);
    try {
      const { message } = await resetPassword({
        accessToken,
        newPassword: password,
      });
      clearStashedRecoveryToken();
      toast.success(message, { classNames: successToastClassNames });
      // ตาม handoff: ไม่ auto-login — ให้ไปกรอก login เอง
      router.push(loginHref);
    } catch (err) {
      const status = err?.status;
      const message =
        err instanceof Error ? err.message : "Could not update password";

      if (status === 401) {
        clearStashedRecoveryToken();
        toast(
          "This reset link is invalid or has expired. Please request a new one.",
          { classNames: errorToastClassNames },
        );
        setTokenStatus("missing");
      } else {
        toast(message, { classNames: errorToastClassNames });
      }
    } finally {
      setLoading(false);
    }
  }

  if (tokenStatus === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-body-2 text-gray-500">Checking reset link...</p>
      </div>
    );
  }

  if (tokenStatus === "missing") {
    return (
      <div className="flex flex-col gap-5 sm:gap-6">
        <header className="flex flex-col items-center gap-1.5 text-center sm:gap-2">
          <h1 className="text-h2">Link expired</h1>
          <p className="text-body-2 text-gray-400">
            This reset link is invalid or has expired. Request a new one from the
            login page.
          </p>
        </header>
        <Link href="/forgot-password" className="btn btn-primary w-full text-center">
          Request new link
        </Link>
        <p className="text-center text-body-3 text-gray-500">
          <Link href={loginHref} className="font-bold text-primary">
            Back to Login
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
      <header className="flex flex-col items-center gap-1.5 text-center sm:gap-2">
        <h1 className="text-h2">Set new password</h1>
        <p className="text-body-2 text-gray-400">
          Choose a new password (at least {MIN_PASSWORD_LENGTH} characters).
        </p>
      </header>

      <div className="flex flex-col gap-2">
        <label htmlFor="reset-password" className="text-body-3 font-bold text-black">
          New password
        </label>
        <PasswordInput
          id="reset-password"
          name="newPassword"
          autoComplete="new-password"
          placeholder="Enter new password"
          minLength={MIN_PASSWORD_LENGTH}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setFieldError("");
          }}
          required
          error={Boolean(fieldError)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="reset-password-confirm"
          className="text-body-3 font-bold text-black"
        >
          Confirm password
        </label>
        <PasswordInput
          id="reset-password-confirm"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Confirm new password"
          minLength={MIN_PASSWORD_LENGTH}
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setFieldError("");
          }}
          required
          error={Boolean(fieldError)}
        />
        {fieldError ? <p className="text-body-3 text-red">{fieldError}</p> : null}
      </div>

      <button className="btn btn-primary w-full" type="submit" disabled={loading}>
        {loading ? "Updating..." : "Update password"}
      </button>

      <p className="text-center text-body-3 text-gray-500">
        <Link href={loginHref} className="font-bold text-primary">
          Back to Login
        </Link>
      </p>
    </form>
  );
}
