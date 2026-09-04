import LegalPageLayout from "@/components/legal/LegalPageLayout";
import {
  LEGAL_APP_NAME,
  LEGAL_EFFECTIVE_DATE,
  LEGAL_PROVIDER_NAME,
  LEGAL_SUPPORT_EMAIL,
} from "@/lib/legal";

export const metadata = {
  title: "Terms of Service | Pet Sitter App",
  description: "Terms of Service for Sitter* pet sitting platform",
};

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service">
      <p>
        <strong>Effective date:</strong> {LEGAL_EFFECTIVE_DATE}
      </p>
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your use of {LEGAL_APP_NAME}{" "}
        operated by {LEGAL_PROVIDER_NAME}. By creating an account or using the Service,
        you agree to these Terms.
      </p>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">1. The Service</h2>
        <p className="mt-2">
          {LEGAL_APP_NAME} is a marketplace that helps pet owners find and book pet
          sitters. We are not a pet-sitting employer; sitters are independent users who
          offer services through the platform.
        </p>
      </section>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">2. Accounts</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>You must provide accurate registration information.</li>
          <li>You are responsible for keeping your login credentials secure.</li>
          <li>You may register as a pet owner, a pet sitter, or both where supported.</li>
          <li>We may suspend or terminate accounts that violate these Terms or applicable law.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">3. Pet owners</h2>
        <p className="mt-2">
          Owners are responsible for accurate pet and booking information, timely
          payment, and communication with sitters. You must only book services you intend
          to use and comply with sitter requirements disclosed on the platform.
        </p>
      </section>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">4. Pet sitters</h2>
        <p className="mt-2">
          Sitters are responsible for the care they provide, accurate availability and
          profile information, and completing bookings in good faith. Payout and bank
          details must be truthful and kept up to date where required by the Service.
        </p>
      </section>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">5. Bookings and payments</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Bookings are subject to sitter acceptance and platform rules.</li>
          <li>Prices and payment methods are shown during checkout.</li>
          <li>Card payments may be authorized at booking and captured according to platform policy.</li>
          <li>Refunds or disputes are handled according to booking status and applicable policies.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">6. Cancellations</h2>
        <p className="mt-2">
          Either party may cancel a booking according to the status and rules shown in
          the app. Repeated cancellations or misuse may result in account restrictions.
          Payment outcomes for cancelled bookings depend on timing and payment method.
        </p>
      </section>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">7. Acceptable use</h2>
        <p className="mt-2">You agree not to:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Use the Service for unlawful, fraudulent, or abusive purposes.</li>
          <li>Harass other users or misrepresent your identity.</li>
          <li>Attempt to bypass payments or safety features of the platform.</li>
          <li>Upload harmful, misleading, or infringing content.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">8. Limitation of liability</h2>
        <p className="mt-2">
          To the fullest extent permitted by law, {LEGAL_PROVIDER_NAME} provides the
          Service &quot;as is&quot; and is not liable for indirect, incidental, or
          consequential damages arising from use of the platform or services arranged
          between users. Our total liability for any claim relating to the Service is
          limited to the amount you paid us for the relevant booking in the preceding
          twelve months, or the minimum amount permitted by law.
        </p>
      </section>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">9. Changes</h2>
        <p className="mt-2">
          We may update these Terms. Continued use after changes are posted constitutes
          acceptance of the updated Terms.
        </p>
      </section>

      <section>
        <h2 className="text-h4 font-bold text-gray-900">10. Contact</h2>
        <p className="mt-2">
          Questions about these Terms:{" "}
          <a href={`mailto:${LEGAL_SUPPORT_EMAIL}`} className="text-primary hover:underline">
            {LEGAL_SUPPORT_EMAIL}
          </a>
        </p>
      </section>
    </LegalPageLayout>
  );
}
