"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AccountSidebar from "@/components/AccountSidebar";
import { getOwnerPet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import PetDetailForm from "./PetDetailForm";

function OwnerPetNotFound({ message }) {
  return (
    <div className="card flex w-full flex-col p-4 sm:p-6 lg:m-4 lg:ml-6 lg:min-h-[888px] lg:w-2/3 lg:p-10">
      <h3 className="text-h3">Pet not found</h3>
      <p className="mt-4 text-body-2 text-gray-500">
        {message || "This pet could not be found."}
      </p>
      <Link href="/owner/pets" className="btn btn-secondary mt-6 w-fit">
        Back to Your Pet
      </Link>
    </div>
  );
}

export default function OwnerPetDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const petId = Array.isArray(id) ? id[0] : id;
  const [pet, setPet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPet() {
      if (!getToken()) {
        router.replace("/login/owner");
        return;
      }

      if (!petId) {
        setIsLoading(false);
        setLoadError("This pet could not be found.");
        return;
      }

      setIsLoading(true);
      setLoadError("");

      try {
        const nextPet = await getOwnerPet(petId);
        if (cancelled) return;
        setPet(nextPet);
      } catch (error) {
        if (cancelled) return;
        if (error.message === "NO_TOKEN" || error.message === "Unauthorized") {
          router.replace("/login/owner");
          return;
        }
        setPet(null);
        setLoadError(error.message || "This pet could not be found.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPet();
    return () => {
      cancelled = true;
    };
  }, [petId, router]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="mx-4 mt-6 flex w-full min-w-0 flex-col pb-8 sm:mx-6 lg:mx-10">
        <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:justify-center lg:gap-0">
          <AccountSidebar />
          {isLoading ? (
            <div className="card flex w-full flex-col p-4 sm:p-6 lg:m-4 lg:ml-6 lg:min-h-[888px] lg:w-2/3 lg:p-10">
              <p className="text-body-2 text-gray-500">Loading pet...</p>
            </div>
          ) : pet ? (
            <PetDetailForm pet={pet} />
          ) : (
            <OwnerPetNotFound message={loadError} />
          )}
        </div>
      </div>
    </div>
  );
}
