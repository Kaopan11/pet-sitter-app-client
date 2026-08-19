/** Step 2 — ข้อมูลผู้จอง (แก้ไขได้) + ข้อความเพิ่มเติม */
export default function InformationStep({
  guest,
  onGuestChange,
  additionalMessage,
  onMessageChange,
}) {
  function updateField(field, value) {
    onGuestChange({ ...guest, [field]: value });
  }

  return (
    <section>
      <div className="space-y-6">
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
            className="input"
            value={guest.name}
            placeholder="Full name"
            onChange={(e) => updateField("name", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
              className="input"
              value={guest.email}
              placeholder="youremail@company.com"
              onChange={(e) => updateField("email", e.target.value)}
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
              className="input"
              value={guest.phone}
              placeholder="xxx-xxx-xxx"
              onChange={(e) => updateField("phone", e.target.value)}
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
