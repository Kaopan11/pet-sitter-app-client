"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import axios from "axios";
import { ChevronLeft, CircleAlert, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import Icon from "@/components/Icon";
import LoadingState from "@/components/LoadingState";
import { errorToastClassNames, successToastClassNames } from "@/lib/toastStyles";
import { isFullProfileUnlocked } from "@/lib/sitterApproval";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const TABS = ["Profile", "Booking", "Reviews"];

const STATUS = {
  Unverified: { label: "Unverified", text: "text-gray-500", dot: "bg-gray-400" },
  "Waiting for verify": { label: "Waiting for verify", text: "text-pink", dot: "bg-pink" },
  Verified: { label: "Verified", text: "text-green", dot: "bg-green" },
  "Waiting for approve": { label: "Waiting for approve", text: "text-pink", dot: "bg-pink" },
  Approved: { label: "Approved", text: "text-green", dot: "bg-green" },
  Rejected: { label: "Rejected", text: "text-red", dot: "bg-red" },
};

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

export default function AdminPetSitterDetailPage() {
  const { id } = useParams();
  const [sitterData, setSitterData] = useState(null);
  const [tab, setTab] = useState("Profile");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [rejectNote, setRejectNote] = useState("");

  const statusStyle = STATUS[sitterData?.approval_status] ?? STATUS.Unverified;
  const isWaiting =
    sitterData?.approval_status === "Waiting for verify" ||
    sitterData?.approval_status === "Waiting for approve";
  const isRejected = sitterData?.approval_status === "Rejected";
  const showFullProfile = isFullProfileUnlocked(sitterData?.approval_status);
  const petTypes = sitterData?.pet_types ?? [];
  const photos = sitterData?.photos ?? [];
  const address = sitterData ? formatAddress(sitterData) : "";
  const mapQuery =
    sitterData?.latitude != null && sitterData?.longitude != null && sitterData.latitude !== ""
      ? `${sitterData.latitude},${sitterData.longitude}`
      : address || "Bangkok";
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`;

  async function loadSitter() {
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/sitters/${id}`);
      setSitterData(response.data.data ?? null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load pet sitter");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSitter();
  }, [id]);

  async function updateStatus(approvalStatus) {
    setIsSaving(true);
    try {
      await axios.patch(`${API_BASE_URL}/api/admin/sitters/${id}/status`, {
        approval_status: approvalStatus,
      });
      const response = await axios.get(`${API_BASE_URL}/api/admin/sitters/${id}`);
      setSitterData(response.data.data ?? null);
      setIsRejectOpen(false);
      toast(
        approvalStatus === "Approved"
          ? "Pet sitter approved"
          : "Pet sitter rejected",
        { classNames: successToastClassNames },
      );
    } catch (err) {
      toast(err.response?.data?.message || "Failed to update status", {
        classNames: errorToastClassNames,
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleReject() {
    const note = reason.trim();
    if (!note) return;
    setRejectNote(note);
    updateStatus("Rejected");
  }

  return (
    <section className="flex flex-col gap-6 pb-12">
      <header className="flex h-12 items-center justify-between">
        <div className="flex items-center gap-2.5">
            <Link
            href="/admin/pet-sitter"
            className="text-gray-400 hover:text-orange-500"
            aria-label="Back to pet sitter list"
            >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </Link>

            <div className="flex items-center gap-6">
                <h1 className="text-h3 text-black">
                    {sitterData?.full_name || "Pet Sitter"}
                </h1>

                {sitterData ? (
                    <p
                    className={`flex items-center gap-2 text-body-2 ${statusStyle.text}`}
                    >
                    <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusStyle.dot}`}
                        aria-hidden="true"
                    />
                    {statusStyle.label}
                    </p>
                ) : null}
            </div>
        </div>

        {isWaiting ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-secondary min-w-30"
              onClick={() => setIsRejectOpen(true)}
              disabled={isSaving}
            >
              Reject
            </button>
            <button
              type="button"
              className="btn btn-primary min-w-30"
              onClick={() => updateStatus("Approved")}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Approve"}
            </button>
          </div>
        ) : null}
      </header>

      {isRejected ? (
        <p className="flex items-start gap-3 rounded-2xl bg-gray-100 px-6 py-4 text-body-2 text-red">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>
            Their request has not been approved
            {rejectNote ? `: '${rejectNote}'` : "."}
          </span>
        </p>
      ) : null}

      {error ? <p className="text-body-2 text-red">{error}</p> : null}

      {isLoading ? (
        <LoadingState />
      ) : sitterData ? (
        <div className="flex flex-col">
          <nav
            className="flex items-center gap-2"
            aria-label="Pet sitter sections"
          >
            {TABS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`rounded-t-2xl px-8 py-3 text-body-2 font-bold ${
                  tab === item
                    ? "bg-white text-orange-500"
                    : "bg-gray-200 text-gray-400 hover:text-gray-500"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          {tab === "Profile" ? (
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
                  <Field label="Introduction">
                    {dash(sitterData.introduction)}
                  </Field>
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
                    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {photos.map((src) => (
                        <li
                          key={src}
                          className="relative h-48 overflow-hidden rounded-md bg-gray-100"
                        >
                          <Image
                            src={src}
                            alt={`${sitterData.pet_sitter_name || sitterData.full_name || "Pet sitter"} gallery photo`}
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

              {showFullProfile ? (
              <section className="flex flex-col gap-4 rounded-md bg-[#FAFAFB] p-6">
                <Field label="Address">{dash(address)}</Field>
                <div className="relative overflow-hidden rounded-md">
                  <iframe
                    title={`${sitterData.full_name || "Pet sitter"} location`}
                    src={mapSrc}
                    className="h-112 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <span className="pointer-events-none absolute top-1/2 left-1/2 z-10 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-orange-500 text-white">
                    <Icon src="/icon/paw.svg" className="h-7 w-7" />
                  </span>
                </div>
              </section>
              ) : null}
            </article>
          ) : (
            <article className="rounded-2xl rounded-tl-none bg-white p-10">
              <p className="py-16 text-center text-body-2 text-gray-400">
                {tab === "Booking" ? "No bookings yet." : "No reviews yet."}
              </p>
            </article>
          )}
        </div>
      ) : null}

      {isRejectOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-title"
            className="w-full max-w-lg rounded-2xl bg-white"
          >
            <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 id="reject-title" className="text-h4 text-gray-900">
                Reject Confirmation
              </h2>
              <button
                type="button"
                onClick={() => setIsRejectOpen(false)}
                className="text-gray-300 hover:text-gray-500"
                aria-label="Close reject confirmation"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </header>

            <div className="flex flex-col gap-2 px-6 py-6">
              <label htmlFor="reject-reason" className="text-body-2 text-black">
                Reason and suggestion
              </label>
              <textarea
                id="reject-reason"
                className="input min-h-30 resize-y"
                placeholder="Admin's suggestion here"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </div>

            <footer className="flex items-center justify-between px-6 pb-6">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsRejectOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleReject}
                disabled={isSaving || !reason.trim()}
              >
                {isSaving ? "Rejecting..." : "Reject"}
              </button>
            </footer>
          </section>
        </div>
      ) : null}
    </section>
  );
}
