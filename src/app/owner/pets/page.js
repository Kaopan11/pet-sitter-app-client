"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PawPrint } from "lucide-react";
import AccountSidebar from "../../../components/AccountSidebar";
import { getOwnerPets } from "@/lib/api";
import { getToken } from "@/lib/auth";

const BADGE_CLASS = {
  Dog: "badge-dog",
  Cat: "badge-cat",
  Bird: "badge-bird",
  Rabbit: "badge-rabbit",
};

export default function OwnerPetsPage() {
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPets() {
      if (!getToken()) {
        router.replace("/login/owner");
        return;
      }

      setIsLoading(true);
      setLoadError("");

      try {
        const pets = await getOwnerPets();
        if (cancelled) return;
        setPets(pets);
      } catch (error) {
        if (cancelled) return;
        if (error.message === "NO_TOKEN" || error.message === "Unauthorized") {
          router.replace("/login/owner");
          return;
        }
        setLoadError(error.message || "Failed to load pets");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPets();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="mx-4 mt-6 flex w-full min-w-0 flex-col pb-8 sm:mx-6 lg:mx-10">
        <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:justify-center lg:gap-0">
          <AccountSidebar />

          <section className="card flex w-full flex-col p-4 sm:p-6 lg:m-4 lg:ml-6 lg:min-h-[888px] lg:w-2/3 lg:p-10">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-h3">Your Pet</h3>
              <Link
                href="/owner/pets/create"
                className="btn btn-primary w-auto shrink-0"
              >
                Create Pet
              </Link>
            </div>

            {loadError && (
              <p className="mt-4 text-body-3 text-red-500">{loadError}</p>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
              {isLoading ? (
                <p className="text-body-2 text-gray-500">Loading pets...</p>
              ) : pets.length === 0 && !loadError ? (
                <p className="text-body-2 text-gray-500">
                  You don&apos;t have any pets yet.
                </p>
              ) : (
                pets.map((pet) => (
                  <Link
                    key={pet.id}
                    href={`/owner/pets/${pet.id}`}
                    className="flex min-w-0 flex-col items-center rounded-2xl border border-gray-200 bg-white px-6 py-8 transition hover:border-orange-400"
                  >
                    {pet.image ? (
                      <img
                        src={pet.image}
                        alt={pet.name}
                        className="size-28 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-28 items-center justify-center rounded-full bg-gray-200">
                        <PawPrint
                          className="size-12 text-white"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                    <h4 className="mt-3 truncate text-h4 text-black sm:mt-4">
                      {pet.name}
                    </h4>
                    <span className={`badge mt-2 ${BADGE_CLASS[pet.type] ?? ""}`}>
                      {pet.type}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
