import AuthShell from "@/components/AuthShell";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export const metadata = {
  title: "Reset Password | Pet Sitter App",
};

/**
 * /reset-password — เปิดจากลิงก์ในเมล (ticket 03)
 * Supabase จะพา token มาใน hash หรือ query → ฟอร์ม client อ่านเอง
 */
export default function ResetPasswordPage() {
  return (
    <AuthShell variant="light">
      <ResetPasswordForm loginHref="/login/owner" />
    </AuthShell>
  );
}
