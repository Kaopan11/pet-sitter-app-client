import AuthShell from "@/components/AuthShell";
import AuthCallbackClient from "@/components/AuthCallbackClient";

export const metadata = {
  title: "Signing in | Pet Sitter App",
};

/**
 * /auth/callback — Supabase พากลับมาที่นี่หลัง Google/Facebook (ticket 04)
 * logic อยู่ฝั่ง client เพราะต้องอ่าน hash/query + เรียก /api/auth/me
 */
export default function AuthCallbackPage() {
  return (
    <AuthShell variant="light">
      <AuthCallbackClient />
    </AuthShell>
  );
}
