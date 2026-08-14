export default function PetSitterProfilePage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-h3 text-black">Pet Sitter Profile</h1>
          <p className="flex items-center gap-2 text-body-2 text-green">
            <span
              className="h-2 w-2 rounded-full bg-green"
              aria-hidden="true"
            />
            Approved
          </p>
        </div>
        <button type="button" className="btn btn-primary min-w-[120px]">
          Update
        </button>
      </header>

      <section
        className="flex flex-col gap-8 rounded-2xl bg-white p-8 md:p-10"
        aria-labelledby="basic-info-title"
      >
        <h2 id="basic-info-title" className="text-body-1 text-gray-400">
          Basic Information
        </h2>

        <div className="flex flex-col gap-2">
          <p className="text-body-3 text-black">Profile Image</p>
          <div className="relative w-fit">
            <div
              className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-gray-200"
              aria-label="Profile image placeholder"
            >
              <ProfileSilhouette />
            </div>
            <button
              type="button"
              className="absolute right-0 bottom-0 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white"
              aria-label="Upload profile photo"
            >
              <PlusIcon />
            </button>
          </div>
        </div>

        <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
          <FormField label="Your full name" required>
            <input className="input" type="text" />
          </FormField>

          <FormField label="Experience" required>
            <div className="relative">
              <select className="input appearance-none pr-10" defaultValue="">
                <option value="" disabled>
                  Select experience
                </option>
                <option value="0-2">0-2 Years</option>
                <option value="3-5">3-5 Years</option>
                <option value="5+">5+ Years</option>
              </select>
              <ChevronIcon />
            </div>
          </FormField>

          <FormField label="Phone Number" required>
            <input className="input" type="tel" />
          </FormField>

          <FormField label="Email" required>
            <input className="input" type="email" />
          </FormField>
        </div>

        <FormField label="Introduction (Describe about yourself as pet sitter)">
          <textarea className="input min-h-[120px] resize-y" />
        </FormField>
      </section>

      <section
        className="flex flex-col gap-6 rounded-2xl bg-white p-8 md:p-10"
        aria-labelledby="pet-sitter-title"
      >
        <h2 id="pet-sitter-title" className="text-body-1 text-gray-400">
          Pet Sitter
        </h2>

        <FormField label="Pet sitter name (Trade Name)" required>
          <input className="input" type="text" />
        </FormField>

        <div className="flex flex-col gap-2">
          <p className="text-body-3 text-black">Pet type</p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-green-light px-4 py-1 text-body-3 text-green">
              Cat ×
            </span>
            <span className="rounded-full bg-green-light px-4 py-1 text-body-3 text-green">
              Dog ×
            </span>
            <span className="rounded-full bg-pink-light px-4 py-1 text-body-3 text-pink">
              Bird ×
            </span>
            <span className="rounded-full bg-blue-light px-4 py-1 text-body-3 text-blue">
              Rabbit ×
            </span>
          </div>
        </div>

        <FormField label="Services (Describe all of your service for pet sitting)">
          <textarea className="input min-h-[120px] resize-y" />
        </FormField>

        <FormField label="My Place (Describe you place)">
          <textarea className="input min-h-[120px] resize-y" />
        </FormField>

        <div className="flex flex-col gap-3">
          <p className="text-body-3 text-black">
            Image Gallery (Maximum 10 images)
          </p>
          <div className="flex flex-wrap gap-4">
            <div
              className="h-28 w-28 rounded-xl bg-gray-200"
              aria-hidden="true"
            />
            <div
              className="h-28 w-28 rounded-xl bg-gray-200"
              aria-hidden="true"
            />
            <div
              className="h-28 w-28 rounded-xl bg-gray-200"
              aria-hidden="true"
            />
            <button
              type="button"
              className="flex h-28 w-28 items-center justify-center rounded-xl bg-orange-100 text-orange-500"
              aria-label="Upload gallery image"
            >
              <PlusIcon />
            </button>
          </div>
        </div>
      </section>

      <section
        className="flex flex-col gap-6 rounded-2xl bg-white p-8 md:p-10"
        aria-labelledby="address-title"
      >
        <h2 id="address-title" className="text-body-1 text-gray-400">
          Address
        </h2>

        <FormField label="Address detail" required>
          <input className="input" type="text" />
        </FormField>

        <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
          <FormField label="District" required>
            <div className="relative">
              <select className="input appearance-none pr-10" defaultValue="">
                <option value="" disabled>
                  Select district
                </option>
              </select>
              <ChevronIcon />
            </div>
          </FormField>

          <FormField label="Sub-district" required>
            <div className="relative">
              <select className="input appearance-none pr-10" defaultValue="">
                <option value="" disabled>
                  Select sub-district
                </option>
              </select>
              <ChevronIcon />
            </div>
          </FormField>

          <FormField label="Province" required>
            <div className="relative">
              <select className="input appearance-none pr-10" defaultValue="">
                <option value="" disabled>
                  Select province
                </option>
              </select>
              <ChevronIcon />
            </div>
          </FormField>

          <FormField label="Post code" required>
            <input className="input" type="text" />
          </FormField>
        </div>

        <div
          className="flex h-56 items-center justify-center rounded-xl bg-gray-200 text-body-2 text-gray-400"
          role="img"
          aria-label="Map placeholder"
        >
          Map preview
        </div>
      </section>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-body-3 text-black">
        {label}
        {required ? <span className="text-red">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function ChevronIcon() {
  return (
    <svg
      className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProfileSilhouette() {
  return (
    <svg
      className="h-20 w-20 text-white"
      viewBox="0 0 80 80"
      aria-hidden="true"
    >
      <circle cx="40" cy="28" r="16" fill="currentColor" />
      <ellipse cx="40" cy="78" rx="30" ry="26" fill="currentColor" />
    </svg>
  );
}
