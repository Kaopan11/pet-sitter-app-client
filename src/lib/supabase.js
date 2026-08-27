/**
 * Supabase browser client (feat/login · ticket 01)
 *
 * ใช้ทำอะไร?
 * - เปิด Google / Facebook ผ่าน Supabase Auth (signInWithOAuth) — ticket 04
 * - อ่าน session / access_token หลังกลับจาก redirect — ticket 03, 04
 *
 * ไม่ใช้ทำอะไร?
 * - ไม่เก็บ pet-sitter-token ที่นี่ (ยังใช้ src/lib/auth.js เหมือน login เดิม)
 * - ไม่ใส่ service role key — ใช้ได้แค่ NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * ค่า env ดูที่ .env.example
 */

import { createClient } from "@supabase/supabase-js";

/** Path ที่ lock กับ BE — ต้องอยู่ใน Supabase Redirect URLs */
export const OAUTH_CALLBACK_PATH = "/auth/callback";

let browserClient;

/** อ่าน URL โปรเจกต์ Supabase (เช่น https://xxxx.supabase.co) */
export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
}

/**
 * Anon (public) key เท่านั้น — ปลอดภัยพอใส่ NEXT_PUBLIC_
 * ห้ามใส่ service_role ใน FE
 */
export function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
}

/** true เมื่อใส่ env ครบ — UI ใช้เช็คก่อนเปิดปุ่ม Social */
export function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

/**
 * URL เต็มที่ให้ Supabase พากลับหลัง OAuth สำเร็จ
 * local → http://localhost:3000/auth/callback
 */
export function getOAuthRedirectTo() {
  if (typeof window === "undefined") {
    return OAUTH_CALLBACK_PATH;
  }
  return `${window.location.origin}${OAUTH_CALLBACK_PATH}`;
}

/**
 * Client เดียวต่อแท็บเบราว์เซอร์ (singleton)
 * เรียกเฉพาะฝั่ง client ("use client" / event handler)
 * ถ้ายังไม่ตั้ง env → คืน null (อย่า crash ทั้งแอป)
 */
export function getSupabaseBrowserClient() {
  if (typeof window === "undefined") {
    return null;
  }

  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(url, anonKey, {
      auth: {
        // อ่าน session จาก hash/query หลัง redirect กลับมา
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return browserClient;
}

/**
 * ดึง access_token จาก session ปัจจุบัน (หลัง OAuth / เปิดลิงก์ reset)
 * ใช้เป็น Bearer ตอนเรียก GET /api/auth/me หรือ POST /api/auth/reset-password
 * ยังไม่มี session → คืน null
 */
export async function getSupabaseAccessToken() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }

  return data.session?.access_token ?? null;
}
