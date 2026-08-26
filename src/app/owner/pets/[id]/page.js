import Link from "next/link";
import AccountSidebar from "@/components/AccountSidebar";
import { getMockPetById } from "@/data/mockPets";
import PetDetailForm from "./PetDetailForm";

export const metadata = {
  title: "Pet Details",
};

function OwnerPetNotFound() {
  return (
    <div className="card flex w-full flex-col p-4 sm:p-6 lg:m-4 lg:ml-6 lg:min-h-[888px] lg:w-2/3 lg:p-10">
      <h3 className="text-h3">Pet not found</h3>
      <p className="mt-4 text-body-2 text-gray-500">
        This pet is not in the mock list.
      </p>
      <Link href="/owner/pets" className="btn btn-secondary mt-6 w-fit">
        Back to Your Pet
      </Link>
    </div>
  );
}

export default async function OwnerPetDetailPage({ params }) {
  const { id } = await params;
  const pet = getMockPetById(id);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="mx-4 mt-6 flex w-full min-w-0 flex-col pb-8 sm:mx-6 lg:mx-10">
        <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:justify-center lg:gap-0">
          <AccountSidebar />
          {pet ? <PetDetailForm pet={pet} /> : <OwnerPetNotFound />}
        </div>
      </div>
    </div>
  );
}
