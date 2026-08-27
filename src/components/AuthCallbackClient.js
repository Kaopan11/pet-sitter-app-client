"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getAuthMe } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import {
  readOAuthRemember,
  resolveOAuthAccessToken,
  stashOAuthPendingToken,
} from "@/lib/supabase";
import { errorToastClassNames } from "@/lib/toastStyles";

/**
 * หลัง Google/Facebook สำเร็จ (ticket 04)
 *
 * flow:
 * 1) อ่าน access_token จาก URL / Supabase session
 * 2) GET /api/auth/me
 * 3a) 200 → saveAuth → เข้าแอปตาม isSitter
 * 3b) 404 Profile incomplete → stash token → /complete-profile
 */
export default function AuthCallbackClient() {
  const router = useRouter();
  const [status, setStatus] = useState("loading"); // loading | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function finishOAuth() {
      try {
        const accessToken = await resolveOAuthAccessToken();
        if (cancelled) return;

        if (!accessToken) {
          setStatus("error");
          setErrorMessage(
            "Could not complete social login. Missing access token. Please try again.",
          );
          return;
        }

        // ล้าง hash ออกจาก address bar หลังอ่าน token
        if (window.location.hash) {
          window.history.replaceState(
            null,
            "",
            `${window.location.pathname}${window.location.search}`,
          );
        }

        let data;
        try {
          data = await getAuthMe(accessToken);
        } catch (err) {
          if (cancelled) return;

          // ยังไม่มีโปรไฟล์ในระบบเรา → ไปกรอก name + phone
          if (err?.status === 404) {
            stashOAuthPendingToken(accessToken);
            router.replace("/complete-profile");
            return;
          }

          throw err;
        }

        if (cancelled) return;

        const persist = readOAuthRemember(true);
        // BE คืน { token, user } — ใช้ token จาก response หรือ accessToken จาก Supabase
        saveAuth(
          {
            token: data?.token || accessToken,
            user: data?.user ?? null,
          },
          persist,
        );

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth-changed"));
        }

        const isSitter = Boolean(data?.user?.isSitter);
        router.replace(isSitter ? "/sitter/profile" : "/");
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Social login failed";
        setStatus("error");
        setErrorMessage(message);
        toast(message, { classNames: errorToastClassNames });
      }
    }

    finishOAuth();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (status === "error") {
    return (
      <div className="flex flex-col gap-5 sm:gap-6">
        <header className="flex flex-col items-center gap-1.5 text-center sm:gap-2">
          <h1 className="text-h2">Login failed</h1>
          <p className="text-body-2 text-gray-400">{errorMessage}</p>
        </header>
        <Link href="/login/owner" className="btn btn-primary w-full text-center">
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <h1 className="text-h2">Signing you in...</h1>
      <p className="text-body-2 text-gray-400">
        Please wait while we finish social login.
      </p>
    </div>
  );
}
