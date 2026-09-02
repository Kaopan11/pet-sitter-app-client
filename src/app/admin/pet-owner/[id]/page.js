"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import LoadingState from "@/components/LoadingState";
import { getAdminOwner } from "@/lib/api";
import { errorToastClassNames } from "@/lib/toastStyles";

const TABS = ["Profile", "Pets", "Reviews"];

const STATUS = {
  Normal: { label: "Normal", text: "text-green", dot: "bg-green" },
  Banned: { label: "Banned", text: "text-red", dot: "bg-red" },
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

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-h4 text-gray-300">{label}</dt>
      <dd className="whitespace-pre-line text-body-2 text-black">{children}</dd>
    </div>
  );
}

function Avatar({ src, alt }) {
  if (!src) {
    return <UserRound className="h-full w-full p-16 text-white" aria-hidden="true" />;
  }

  return <Image src={src} alt={alt} fill unoptimized className="object-cover" />;
}

export default function AdminPetOwnerDetailPage() {
  const { id } = useParams();
  const [owner, setOwner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("Profile");
  const [ownerStatus, setOwnerStatus] = useState("Normal");
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);

  const statusStyle = STATUS[ownerStatus] ?? STATUS.Normal;

  async function loadOwner() {
    setIsLoading(true);
    setError("");
    try {
      const nextOwner = await getAdminOwner(id);
      setOwner(nextOwner);
      setOwnerStatus(nextOwner.status);
    } catch (err) {
      setOwner(null);
      setError(err.message || "Failed to load pet owner");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (id) loadOwner();
  }, [id]);

  function handleToggleBanStatus() {
    toast("Ban status cannot be updated yet.", { classNames: errorToastClassNames });
    setIsBanModalOpen(false);
  }

  function handleSuspendPet() {
    toast("Pet suspend is not available yet.", { classNames: errorToastClassNames });
    setIsSuspendModalOpen(false);
    setSelectedPet(null);
  }

  const activePets = (owner?.pets ?? []).filter((pet) => !pet.isSuspended);

  return (
    <section className="flex flex-col gap-6 pb-12">
      <header className="flex h-12 items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/pet-owner"
            className="text-gray-400 hover:text-orange-500"
            aria-label="Back to pet owner list"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </Link>

          <div className="flex items-center gap-6">
            <h1 className="text-h3 text-black">{owner?.name || "Pet Owner"}</h1>
            {owner ? (
              <p className={`flex items-center gap-2 text-body-2 ${statusStyle.text}`}>
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusStyle.dot}`}
                  aria-hidden="true"
                />
                {statusStyle.label}
              </p>
            ) : null}
          </div>
        </div>
      </header>

      {error ? <p className="text-body-2 text-red">{error}</p> : null}

      {isLoading ? (
        <LoadingState />
      ) : owner ? (
        <div className="flex flex-col">
          <nav className="flex items-center gap-2" aria-label="Pet owner sections">
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
                {item === "Pets" ? ` (${owner.pets.length})` : ""}
                {item === "Reviews" ? ` (${owner.reviews.length})` : ""}
              </button>
            ))}
          </nav>

          {tab === "Profile" ? (
            <article className="flex flex-col gap-10 rounded-2xl rounded-tl-none bg-white p-10">
              <div className="flex flex-col gap-10 md:flex-row md:items-start">
                <div className="relative size-60 shrink-0 overflow-hidden rounded-full bg-gray-200">
                  <Avatar src={owner.avatar} alt={`${owner.name || "Pet owner"} profile`} />
                </div>

                <dl className="flex min-w-0 flex-1 flex-col gap-10 rounded-md bg-[#FAFAFB] p-6">
                  <Field label="Pet Owner Name">{dash(owner.name)}</Field>
                  <Field label="Email">{dash(owner.email)}</Field>
                  <Field label="Phone">{dash(owner.phone)}</Field>
                  <Field label="ID Number">{dash(owner.idCard)}</Field>
                  <Field label="Date of Birth">{dash(owner.dob)}</Field>
                </dl>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsBanModalOpen(true)}
                  className="text-body-2 font-bold text-orange-500 hover:text-orange-600 hover:underline"
                >
                  {ownerStatus === "Banned" ? "Unban This User" : "Ban This User"}
                </button>
              </div>
            </article>
          ) : tab === "Pets" ? (
            <article className="rounded-2xl rounded-tl-none bg-white p-10">
              {activePets.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {activePets.map((pet) => {
                    const badge = PET_BADGE[String(pet.type ?? "").toLowerCase()] ?? "badge";
                    return (
                      <button
                        key={pet.id}
                        type="button"
                        onClick={() => setSelectedPet(pet)}
                        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white p-6 hover:border-orange-500"
                      >
                        <div className="relative size-24 shrink-0 overflow-hidden rounded-full bg-gray-200">
                          {pet.image ? (
                            <Image
                              src={pet.image}
                              alt={pet.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <UserRound className="h-full w-full p-6 text-white" aria-hidden="true" />
                          )}
                        </div>
                        <span className="text-body-1 font-bold text-black">{pet.name}</span>
                        <span className={`badge ${badge}`}>{pet.type || "Pet"}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="py-16 text-center text-body-2 text-gray-400">No pets yet.</p>
              )}
            </article>
          ) : (
            <article className="rounded-2xl rounded-tl-none bg-white p-10">
              {owner.reviews.length > 0 ? (
                <div className="flex flex-col divide-y divide-gray-200">
                  {owner.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex flex-col items-start justify-between gap-4 py-6 first:pt-0 last:pb-0 sm:flex-row"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-gray-200">
                          {review.sitterAvatar ? (
                            <Image
                              src={review.sitterAvatar}
                              alt={review.sitterName}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <UserRound className="h-full w-full p-2.5 text-white" aria-hidden="true" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-body-1 font-bold text-black">{review.sitterName}</span>
                          <span className="text-body-3 text-gray-400">{review.date}</span>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col gap-1.5 sm:max-w-md">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, index) => (
                            <svg
                              key={index}
                              className={`h-4 w-4 ${
                                index < review.rating
                                  ? "fill-green text-green"
                                  : "fill-gray-200 text-gray-200"
                              }`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-body-2 text-gray-500">{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-16 text-center text-body-2 text-gray-400">No reviews yet.</p>
              )}
            </article>
          )}
        </div>
      ) : null}

      {isBanModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="ban-title"
            className="w-full max-w-lg rounded-2xl bg-white"
          >
            <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 id="ban-title" className="text-h4 text-gray-900">
                {ownerStatus === "Banned" ? "Unban User" : "Ban User"}
              </h2>
              <button
                type="button"
                onClick={() => setIsBanModalOpen(false)}
                className="text-gray-300 hover:text-gray-500"
                aria-label="Close ban confirmation"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </header>
            <div className="px-6 py-6">
              <p className="text-body-2 text-black">
                {ownerStatus === "Banned"
                  ? "Are you sure to unban this user?"
                  : "Are you sure to ban this user?"}
              </p>
            </div>
            <footer className="flex items-center justify-between px-6 pb-6">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsBanModalOpen(false)}
              >
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleToggleBanStatus}>
                {ownerStatus === "Banned" ? "Unban User" : "Ban User"}
              </button>
            </footer>
          </section>
        </div>
      ) : null}

      {selectedPet && !isSuspendModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="pet-title"
            className="w-full max-w-xl rounded-2xl bg-white"
          >
            <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 id="pet-title" className="text-h4 text-gray-900">
                {selectedPet.name}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedPet(null)}
                className="text-gray-300 hover:text-gray-500"
                aria-label="Close pet details"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </header>
            <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-start sm:p-8">
              <div className="flex shrink-0 flex-col items-center gap-3">
                <div className="relative size-40 overflow-hidden rounded-full bg-gray-200">
                  {selectedPet.image ? (
                    <Image
                      src={selectedPet.image}
                      alt={selectedPet.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <UserRound className="h-full w-full p-10 text-white" aria-hidden="true" />
                  )}
                </div>
                <span className="text-body-1 font-bold text-black">{selectedPet.name}</span>
              </div>
              <dl className="grid w-full flex-1 grid-cols-2 gap-x-6 gap-y-4 rounded-md bg-[#FAFAFB] p-6">
                <Field label="Pet Type">{dash(selectedPet.type)}</Field>
                <Field label="Breed">{dash(selectedPet.breed)}</Field>
                <Field label="Sex">{dash(selectedPet.sex)}</Field>
                <Field label="Age">{dash(selectedPet.age)}</Field>
                <Field label="Color">{dash(selectedPet.color)}</Field>
                <Field label="Weight">{dash(selectedPet.weight)}</Field>
                <div className="col-span-2">
                  <Field label="About">{dash(selectedPet.about)}</Field>
                </div>
              </dl>
            </div>
            <footer className="flex justify-end px-6 pb-6">
              <button
                type="button"
                onClick={() => setIsSuspendModalOpen(true)}
                className="text-body-2 font-bold text-orange-500 hover:text-orange-600 hover:underline"
              >
                Suspend This Pet
              </button>
            </footer>
          </section>
        </div>
      ) : null}

      {isSuspendModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="suspend-title"
            className="w-full max-w-lg rounded-2xl bg-white"
          >
            <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 id="suspend-title" className="text-h4 text-gray-900">
                Suspend Pet
              </h2>
              <button
                type="button"
                onClick={() => setIsSuspendModalOpen(false)}
                className="text-gray-300 hover:text-gray-500"
                aria-label="Close suspend confirmation"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </header>
            <div className="px-6 py-6">
              <p className="text-body-2 text-black">Are you sure to suspend this pet?</p>
            </div>
            <footer className="flex items-center justify-between px-6 pb-6">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsSuspendModalOpen(false)}
              >
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSuspendPet}>
                Suspend This Pet
              </button>
            </footer>
          </section>
        </div>
      ) : null}
    </section>
  );
}
