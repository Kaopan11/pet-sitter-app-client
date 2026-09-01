import AuthShell from "@/components/AuthShell";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export const metadata = {
  title: "Forgot Password | Pet Sitter App",
};

/**
 * /forgot-password — ขอลิงก์รีเซ็ตรหัส (ticket 02)
 * query เสริม: ?email=... (พกมาจากช่องอีเมลหน้า Login)
 */
export default async function ForgotPasswordPage({ searchParams }) {
  const params = await searchParams;
  const initialEmail =
    typeof params?.email === "string" ? params.email.trim() : "";

  return (
    <AuthShell variant="light">
      <ForgotPasswordForm initialEmail={initialEmail} backHref="/login/owner" />
    </AuthShell>
  );
}
