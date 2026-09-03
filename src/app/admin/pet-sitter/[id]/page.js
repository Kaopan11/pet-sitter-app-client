"use client";

import { useContext } from "react";
import Image from "next/image";
import { UserRound } from "lucide-react";
import LocationPicker from "@/components/location/LocationPicker";
import { isFullProfileUnlocked } from "@/lib/sitterApproval";
import { SitterDetailContext } from "./sitter-detail-context";

const PET_BADGE = {
  dog: "badge-dog",
  cat: "badge-cat",
  bird: "badge-bird",
  rabbit: "badge-rabbit",
};

function dash(value) {
  return value || "—";
}

function formatDateOfBirth(value) {
  if (!value) return "—";
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return value;
  const date = new Date(year, month - 1, day);
  return `${day} ${date.toLocaleString("en-GB", { month: "long" })} ${year}`;
}

function formatPhone(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length !== 10) return dash(value);
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

function formatIdNumber(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length !== 13) return dash(value);
  return `${digits.slice(0, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
}

function formatExperience(value) {
  if (!value) return "—";
  const text = String(value).trim();
  if (/years?$/i.test(text)) return text;
  return `${text} Years`;
}

function formatAddress(sitter) {
  return [
    sitter.address_detail,
    sitter.sub_district,
    sitter.district,
    sitter.province,
    sitter.post_code,
  ]
    .filter(Boolean)
    .join(", ");
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-h4 text-gray-300">{label}</dt>
      <dd className="whitespace-pre-line text-body-2 text-black">{children}</dd>
    </div>
  );
}

export default function AdminPetSitterProfilePage() {
  const sitterData = useContext(SitterDetailContext);
  const showFullProfile = isFullProfileUnlocked(sitterData.approval_status);
  const petTypes = sitterData.pet_types ?? [];
  const photos = sitterData.photos ?? [];
  const address = formatAddress(sitterData);
  const locationAddress = {
    addressDetail: sitterData.address_detail ?? "",
    subDistrict: sitterData.sub_district ?? "",
    district: sitterData.district ?? "",
    province: sitterData.province ?? "",
    postcode: sitterData.post_code ?? "",
    latitude: sitterData.latitude,
    longitude: sitterData.longitude,
  };

  return (
    <article className="flex flex-col gap-10 rounded-2xl rounded-tl-none bg-white p-10">
      <div className="flex flex-col gap-10 md:flex-row md:items-start">
        <div className="relative size-60 shrink-0 overflow-hidden rounded-full bg-gray-200">
          {sitterData.avatar_url ? (
            <Image
              src={sitterData.avatar_url}
              alt={`${sitterData.full_name || "Pet sitter"} profile`}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <UserRound
              className="h-full w-full p-16 text-white"
              aria-hidden="true"
            />
          )}
        </div>

        <dl className="flex min-w-0 flex-1 flex-col gap-10 rounded-md bg-[#FAFAFB] p-6">
          <Field label="Full Name">{dash(sitterData.full_name)}</Field>
          <Field label="Experience">
            {formatExperience(sitterData.experience_years)}
          </Field>
          <Field label="Phone">{formatPhone(sitterData.phone)}</Field>
          <Field label="Email">{dash(sitterData.email)}</Field>
          <Field label="ID Number">
            {formatIdNumber(sitterData.id_number)}
          </Field>
          <Field label="Date of Birth">
            {formatDateOfBirth(sitterData.date_of_birth)}
          </Field>
          <Field label="Introduction">{dash(sitterData.introduction)}</Field>
        </dl>
      </div>

      {showFullProfile ? (
        <section className="flex flex-col gap-10 rounded-md bg-[#FAFAFB] p-6">
          <Field label="Pet sitter name (Trade Name)">
            {dash(sitterData.pet_sitter_name)}
          </Field>

          <div className="flex flex-col gap-1">
            <p className="text-h4 text-gray-300">Pet type</p>
            <div className="flex flex-wrap gap-2">
              {petTypes.length === 0 ? (
                <p className="text-body-2 text-black">—</p>
              ) : (
                petTypes.map((type) => {
                  const label = typeof type === "string" ? type : type.name;
                  const key = String(label).toLowerCase();
                  return (
                    <span
                      key={label}
                      className={`badge ${PET_BADGE[key] ?? "badge"}`}
                    >
                      {label}
                    </span>
                  );
                })
              )}
            </div>
          </div>

          <Field label="Services">{dash(sitterData.services)}</Field>
          <Field label="My Place">{dash(sitterData.my_place)}</Field>

                <div className="flex flex-col gap-1">
                  <p className="text-h4 text-gray-300">Image Gallery</p>
                  {photos.length > 0 ? (
                    <ul className="flex flex-wrap gap-4">
                      {photos.map((src) => (
                        <li
                          key={src}
                          className="relative h-46 w-62 overflow-hidden bg-gray-100"
                        >
                          <Image
                            src={src}
                            alt="gallery photo"
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-body-2 text-black">—</p>
                  )}
                </div>
              </section>
              ) : null}

      {/* แสดงแผนที่ */}
      {showFullProfile ? (
        <section className="flex flex-col gap-4 rounded-md bg-[#FAFAFB] p-6">
          <Field label="Address">{dash(address)}</Field>
          <LocationPicker
            address={locationAddress}
          />
        </section>
      ) : null}
    </article>
  );
}
