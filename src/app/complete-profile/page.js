import AuthShell from "@/components/AuthShell";
import Link from "next/link";

export const metadata = {
  title: "Complete Profile | Pet Sitter App",
};

/**
 * /complete-profile — placeholder จนกว่า ticket 05
 * ticket 04 พาผู้ใช้ Social ที่ยังไม่มีโปรไฟล์มาที่นี่
 */
export default function CompleteProfilePlaceholderPage() {
  return (
    <AuthShell variant="light">
      <div className="flex flex-col gap-5 sm:gap-6">
        <header className="flex flex-col items-center gap-1.5 text-center sm:gap-2">
          <h1 className="text-h2">Complete your profile</h1>
          <p className="text-body-2 text-gray-400">
            Almost done — we still need your name and phone. This form will be
            available shortly. You can return to login for now.
          </p>
        </header>
        <Link href="/login/owner" className="btn btn-primary w-full text-center">
          Back to Login
        </Link>
      </div>
    </AuthShell>
  );
}
