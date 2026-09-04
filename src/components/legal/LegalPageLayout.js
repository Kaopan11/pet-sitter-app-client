import Link from "next/link";
import AuthLogo from "@/components/AuthLogo";

/** Layout ร่วมหน้า legal — public ไม่ต้อง login */
export default function LegalPageLayout({ title, children }) {
  return (
    <main className="min-h-svh bg-white">
      <header className="border-b border-gray-100 px-5 py-4 md:px-20">
        <AuthLogo />
      </header>

      <article className="mx-auto max-w-3xl px-5 py-10 md:py-14">
        <h1 className="text-h2 font-bold text-gray-900">{title}</h1>
        <div className="mt-8 space-y-6 text-body-2 leading-relaxed text-gray-600">
          {children}
        </div>

        <nav className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-body-3">
          <Link href="/privacy-policy" className="font-medium text-primary hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="font-medium text-primary hover:underline">
            Terms of Service
          </Link>
          <Link href="/data-deletion" className="font-medium text-primary hover:underline">
            Data Deletion
          </Link>
          <Link href="/login/owner" className="font-medium text-gray-500 hover:underline">
            Back to login
          </Link>
        </nav>
      </article>
    </main>
  );
}
