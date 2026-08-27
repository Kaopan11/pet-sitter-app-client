"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  isSupabaseConfigured,
  signInWithOAuthProvider,
  stashOAuthRemember,
} from "@/lib/supabase";
import { errorToastClassNames } from "@/lib/toastStyles";

/**
 * ปุ่ม Facebook / Google (ticket 04)
 * กดแล้ว → stash Remember me → Supabase signInWithOAuth → /auth/callback
 */
export default function SocialAuthButtons({ remember = true }) {
  const [loadingProvider, setLoadingProvider] = useState(null);

  async function handleOAuth(provider) {
    if (!isSupabaseConfigured()) {
      toast(
        "Social login is not configured. Add Supabase keys to .env.local.",
        { classNames: errorToastClassNames },
      );
      return;
    }

    setLoadingProvider(provider);
    // เก็บค่า Remember ข้าม redirect (หน้า callback จะอ่านตอน saveAuth)
    stashOAuthRemember(remember);

    try {
      await signInWithOAuthProvider(provider);
      // สำเร็จแล้วเบราว์เซอร์จะออกจากหน้านี้ไป Google/Facebook
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Social login failed";
      toast(message, { classNames: errorToastClassNames });
      setLoadingProvider(null);
    }
  }

  const busy = Boolean(loadingProvider);

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="shrink-0 text-body-3 text-gray-400">Or Continue With</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => handleOAuth("facebook")}
          className="btn btn-social w-full gap-1.5 sm:gap-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <img src="/icon/facebook.svg" alt="" className="size-5 shrink-0" />
          <span className="truncate">
            {loadingProvider === "facebook" ? "..." : "Facebook"}
          </span>
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => handleOAuth("google")}
          className="btn btn-social w-full gap-1.5 sm:gap-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <img src="/icon/google.svg" alt="" className="size-5 shrink-0" />
          <span className="truncate">
            {loadingProvider === "google" ? "..." : "Gmail"}
          </span>
        </button>
      </div>
    </div>
  );
}
