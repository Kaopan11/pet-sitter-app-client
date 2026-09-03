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
  title: "Data Deletion | Pet Sitter App",
  description: "How to request deletion of your Sitter* account and personal data",
};

export default function DataDeletionPage() {
  return (
    <LegalPageLayout title="Data Deletion Instructions">
      <p>
        <strong>Effective date:</strong> {LEGAL_EFFECTIVE_DATE}
      </p>
      <p>
        You can request deletion of your {LEGAL_APP_NAME} account and associated
        personal data managed by {LEGAL_PROVIDER_NAME}. This page explains how.
      </p>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">What we delete</h2>
        <p className="mt-2">When your deletion request is processed, we aim to remove or anonymize:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Your account profile (name, email, phone, profile photo).</li>
          <li>Pet profiles you created.</li>
          <li>Authentication data linked to your account (including social login associations).</li>
          <li>Other personal data we are not required to retain by law.</li>
        </ul>
        <p className="mt-2">
          Some booking or payment records may be retained in anonymized or aggregated form
          where required for accounting, fraud prevention, or legal compliance.
        </p>
      </section>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">How to request deletion</h2>
        <ol className="mt-2 list-decimal space-y-2 pl-5">
          <li>
            Send an email from the address associated with your account to{" "}
            <a href={`mailto:${LEGAL_SUPPORT_EMAIL}`} className="text-primary hover:underline">
              {LEGAL_SUPPORT_EMAIL}
            </a>
            .
          </li>
          <li>
            Use the subject line: <strong>Account deletion request</strong>.
          </li>
          <li>
            Include your full name and the email you used to register (or sign in with
            Google/Facebook).
          </li>
          <li>
            Optionally state whether you signed in with email, Google, or Facebook so we
            can locate your account faster.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">Processing time</h2>
        <p className="mt-2">
          We will confirm receipt of your request and complete deletion within
          approximately <strong>{LEGAL_DELETION_DAYS}</strong>, unless a longer period
          is required by law or to resolve an active dispute or payment issue.
        </p>
      </section>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">Facebook / Meta login users</h2>
        <p className="mt-2">
          If you signed up using Facebook, you may also remove the app from your Facebook
          settings. Submitting a deletion request to us ensures we remove your data from
          our systems as described in our{" "}
          <Link href="/privacy-policy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">Questions</h2>
        <p className="mt-2">
          Contact{" "}
          <a href={`mailto:${LEGAL_SUPPORT_EMAIL}`} className="text-primary hover:underline">
            {LEGAL_SUPPORT_EMAIL}
          </a>{" "}
          for help with data deletion or access requests.
        </p>
      </section>
    </LegalPageLayout>
  );
}
