import AuthShell from "@/components/AuthShell";
import CompleteProfileForm from "@/components/CompleteProfileForm";

export const metadata = {
  title: "Complete Profile | Pet Sitter App",
};

/**
 * /complete-profile — กรอก name + phone หลัง Social ครั้งแรก (ticket 05)
 * token มาจาก sessionStorage ที่ /auth/callback stash ไว้ตอนได้ 404
 */
export default function CompleteProfilePage() {
  return (
    <AuthShell variant="light">
      <CompleteProfileForm loginHref="/login/owner" />
    </AuthShell>
  );
}
