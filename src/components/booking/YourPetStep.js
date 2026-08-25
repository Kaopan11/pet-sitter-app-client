import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/Icon";

/** map ประเภทสัตว์ → class badge ใน globals.css */
const PET_BADGE = {
  dog: "badge-dog",
  cat: "badge-cat",
  bird: "badge-bird",
  rabbit: "badge-rabbit",
};

function isRemoteSrc(src) {
  return String(src ?? "").startsWith("http");
}

function PetTypeBadge({ petType }) {
  const key = String(petType).toLowerCase();
  const label = key ? key.charAt(0).toUpperCase() + key.slice(1) : "Pet";

  return <span className={`badge ${PET_BADGE[key] ?? ""}`}>{label}</span>;
}

function PetCheckbox({ checked, disabled }) {
  return (
    <span
      className={`flex size-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
        disabled
          ? "border-gray-200 bg-gray-50"
          : checked
            ? "border-orange-500 bg-orange-500"
            : "border-gray-200 bg-white"
      }`}
      aria-hidden
    >
      {checked && !disabled && (
        <Icon src="/icon/check.svg" className="size-3.5 text-white" />
      )}
    </span>
  );
}

export default function YourPetStep({
  pets,
  sitterPetTypes,
  selectedPetIds,
  onTogglePet,
}) {
  /** สัตว์ที่ sitter ไม่รับ → เลือกไม่ได้ (จาง + disabled) */
  function isEligible(pet) {
    return sitterPetTypes.includes(String(pet.petType).toLowerCase());
  }

  const hasPets = pets.length > 0;

  return (
    <section>
      <h2 className="text-body-1 font-medium text-gray-900">Choose your pet</h2>

      {!hasPets ? (
        <p className="mt-3 text-body-2 text-gray-400">
          You don&apos;t have any pets yet. Create one to continue booking.
        </p>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
        {pets.map((pet) => {
          const eligible = isEligible(pet);
          const selected = selectedPetIds.includes(pet.id);
          const remote = isRemoteSrc(pet.avatarUrl);

          return (
            <label
              key={pet.id}
              className={`relative flex min-h-55 flex-col items-center rounded-2xl border border-gray-100 bg-white px-4 py-6 transition-colors ${
                !eligible
                  ? "cursor-not-allowed opacity-40"
                  : selected
                    ? "cursor-pointer border-orange-500"
                    : "cursor-pointer hover:border-orange-200"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={selected}
                disabled={!eligible}
                onChange={() => onTogglePet(pet.id)}
              />

              <div className="absolute top-4 right-4">
                <PetCheckbox checked={selected} disabled={!eligible} />
              </div>

              <div className="relative mt-2 size-22 overflow-hidden rounded-full bg-gray-100">
                <Image
                  src={pet.avatarUrl}
                  alt={pet.name}
                  fill
                  sizes="88px"
                  unoptimized={remote}
                  className="object-cover"
                />
              </div>

              <p className="mt-4 text-center text-body-1 font-bold text-gray-900">
                {pet.name}
              </p>
              <div className="mt-2">
                <PetTypeBadge petType={pet.petType} />
              </div>
            </label>
          );
        })}

        <Link
          href="/owner/pets"
          className="flex min-h-55 flex-col items-center justify-center gap-4 rounded-2xl bg-orange-100 px-4 py-6 transition-colors hover:bg-orange-200"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-orange-500">
            <Icon src="/icon/plus.svg" className="size-6 text-white" />
          </span>
          <span className="text-body-1 font-bold text-orange-500">
            Create New Pet
          </span>
        </Link>
      </div>
    </section>
  );
}
