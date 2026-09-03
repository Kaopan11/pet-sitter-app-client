import Link from "next/link";

/** ข้อความยอมรับ legal ใต้ฟอร์ม login/register (OAuth flow) */
export default function LegalAuthNotice() {
  return (
    <div className="space-y-1 text-center text-body-3 leading-relaxed text-gray-500">
      <p>
        By continuing, you agree to our{" "}
        <Link
          href="/terms-of-service"
          className="whitespace-nowrap font-medium text-primary hover:underline"
        >
          Terms
        </Link>
        {" "}and{" "}
        <Link
          href="/privacy-policy"
          className="whitespace-nowrap font-medium text-primary hover:underline"
        >
          Privacy Policy
        </Link>
        .
      </p>
      <p>
        <Link
          href="/data-deletion"
          className="whitespace-nowrap font-medium text-primary hover:underline"
        >
          How to delete your data
        </Link>
      </p>
    </div>
  );
}
