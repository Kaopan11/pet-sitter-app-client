import Link from "next/link";

/**
 * Step 2 — ข้อมูลผู้จองจากโปรไฟล์ (อ่านอย่างเดียว) + ข้อความถึง sitter (optional)
 */
export default function InformationStep({
  guest,
  additionalMessage,
  onMessageChange,
  incomplete = false,
  completeProfileHref = "/owner/profile",
}) {
  return (
    <section>
      <div className="space-y-6">
        {incomplete ? (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-body-2 text-orange-600">
            Please complete your profile before booking.{" "}
            <Link
              href={completeProfileHref}
              className="font-bold underline underline-offset-2"
            >
              Update profile
            </Link>
          </div>
        ) : null}

        <div>
          <label
            htmlFor="guest-name"
            className="mb-2 block text-body-2 font-medium text-gray-600"
          >
            Your Name<span className="text-orange-500">*</span>
          </label>
          <input
            id="guest-name"
            type="text"
            className="input bg-gray-100 text-black"
            value={guest.name}
            placeholder="Full name"
            readOnly
            aria-readonly="true"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="guest-email"
              className="mb-2 block text-body-2 font-medium text-gray-600"
            >
              Email<span className="text-orange-500">*</span>
            </label>
            <input
              id="guest-email"
              type="email"
              className="input bg-gray-100 text-black"
              value={guest.email}
              placeholder="youremail@company.com"
              readOnly
              aria-readonly="true"
            />
          </div>

          <div>
            <label
              htmlFor="guest-phone"
              className="mb-2 block text-body-2 font-medium text-gray-600"
            >
              Phone<span className="text-orange-500">*</span>
            </label>
            <input
              id="guest-phone"
              type="tel"
              className="input bg-gray-100 text-black"
              value={guest.phone}
              placeholder="xxx-xxx-xxx"
              readOnly
              aria-readonly="true"
            />
          </div>
        </div>

        <div className="h-px w-full bg-gray-100" aria-hidden />

        <div>
          <label
            htmlFor="additional-message"
            className="mb-2 block text-body-2 font-medium text-gray-600"
          >
            Additional Message (To pet sitter)
          </label>
          <textarea
            id="additional-message"
            className="input min-h-40 resize-y"
            value={additionalMessage}
            onChange={(e) => onMessageChange(e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
