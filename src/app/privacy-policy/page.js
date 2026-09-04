import Link from "next/link";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import {
  LEGAL_APP_NAME,
  LEGAL_DELETION_DAYS,
  LEGAL_EFFECTIVE_DATE,
  LEGAL_PROVIDER_NAME,
  LEGAL_SUPPORT_EMAIL,
} from "@/lib/legal";

export const metadata = {
  title: "Privacy Policy | Pet Sitter App",
  description: "Privacy Policy for Sitter* pet sitting platform",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <p>
        <strong>Effective date:</strong> {LEGAL_EFFECTIVE_DATE}
      </p>
      <p>
        This Privacy Policy describes how {LEGAL_PROVIDER_NAME} (&quot;we&quot;, &quot;us&quot;)
        collects, uses, and protects your information when you use {LEGAL_APP_NAME} (the
        &quot;Service&quot;).
      </p>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">1. Who we are</h2>
        <p className="mt-2">
          {LEGAL_APP_NAME} is a platform that connects pet owners with pet sitters for
          booking and payment. For privacy-related requests, contact us at{" "}
          <a href={`mailto:${LEGAL_SUPPORT_EMAIL}`} className="text-primary hover:underline">
            {LEGAL_SUPPORT_EMAIL}
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">2. Information we collect</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Account data:</strong> name, email address, phone number, profile
            photo, and password (stored securely by our authentication provider).
          </li>
          <li>
            <strong>Social login (OAuth):</strong> when you sign in with Google or
            Facebook, we receive basic profile information (such as name, email, and
            profile picture) as permitted by those providers.
          </li>
          <li>
            <strong>Pet information:</strong> pet names, types, photos, and related
            details you provide.
          </li>
          <li>
            <strong>Booking data:</strong> dates, times, messages, booking status, and
            transaction references.
          </li>
          <li>
            <strong>Payment data:</strong> payment method type and transaction status.
            Card details are processed by Stripe; we do not store full card numbers on
            our servers.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">3. How we use your information</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Create and manage your account (registration and login).</li>
          <li>Authenticate you, including social sign-in.</li>
          <li>Facilitate bookings between pet owners and pet sitters.</li>
          <li>Process payments and payouts.</li>
          <li>Communicate about bookings, account security, and support.</li>
          <li>Improve the Service and comply with legal obligations.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">4. Third-party services</h2>
        <p className="mt-2">We use trusted third parties to operate the Service:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Supabase</strong> — authentication and secure storage.
          </li>
          <li>
            <strong>Stripe</strong> — payment processing.
          </li>
          <li>
            <strong>Google</strong> — optional sign-in (OAuth).
          </li>
          <li>
            <strong>Meta / Facebook</strong> — optional sign-in (OAuth).
          </li>
        </ul>
        <p className="mt-2">
          These providers process data according to their own privacy policies. We only
          share what is necessary to provide the Service.
        </p>
      </section>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">5. Cookies and session storage</h2>
        <p className="mt-2">
          We use browser storage to keep you signed in (for example, authentication
          tokens and your &quot;Remember me&quot; preference). These are essential for
          login and account security. We do not use third-party advertising cookies.
        </p>
      </section>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">6. Your rights</h2>
        <p className="mt-2">Depending on your location, you may have the right to:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Access the personal data we hold about you.</li>
          <li>Correct inaccurate information in your profile.</li>
          <li>Request deletion of your account and associated data.</li>
          <li>Withdraw consent where processing is based on consent.</li>
        </ul>
        <p className="mt-2">
          To exercise these rights, email{" "}
          <a href={`mailto:${LEGAL_SUPPORT_EMAIL}`} className="text-primary hover:underline">
            {LEGAL_SUPPORT_EMAIL}
          </a>{" "}
          or follow our{" "}
          <Link href="/data-deletion" className="text-primary hover:underline">
            Data Deletion
          </Link>{" "}
          instructions. We aim to respond within {LEGAL_DELETION_DAYS}.
        </p>
      </section>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">7. Data retention</h2>
        <p className="mt-2">
          We retain your information while your account is active and as needed to
          provide the Service, resolve disputes, and meet legal requirements. When you
          request deletion, we remove or anonymize your data within a reasonable period,
          except where we must keep certain records by law.
        </p>
      </section>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">8. Changes to this policy</h2>
        <p className="mt-2">
          We may update this Privacy Policy from time to time. We will post the revised
          version on this page and update the effective date above.
        </p>
      </section>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">9. Contact</h2>
        <p className="mt-2">
          Questions about this Privacy Policy:{" "}
          <a href={`mailto:${LEGAL_SUPPORT_EMAIL}`} className="text-primary hover:underline">
            {LEGAL_SUPPORT_EMAIL}
          </a>
        </p>
      </section>
    </LegalPageLayout>
  );
}
