import Link from "next/link";
import AccountSidebar from "../../../components/AccountSidebar";
import { MOCK_PETS } from "@/data/mockPets";

const BADGE_CLASS = {
  Dog: "badge-dog",
  Cat: "badge-cat",
  Bird: "badge-bird",
};

export default function OwnerPetsPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="mx-4 mt-6 flex w-full min-w-0 flex-col pb-8 sm:mx-6 lg:mx-10">
        {/* <nav
          aria-label="Breadcrumb"
          className="mb-2 text-body-3 text-gray-400 lg:px-4"
        >
          <span>Account</span>
          <span className="mx-1">{">"}</span>
          <span>Pet list</span>
        </nav> */}

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

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
              {MOCK_PETS.map((pet) => (
                <Link
                  key={pet.id}
                  href={`/owner/pets/${pet.id}`}
                  className="flex min-w-0 flex-col items-center rounded-2xl border border-gray-200 bg-white px-6 py-8 transition hover:border-orange-400"
                >
                  <img
                    src={pet.image}
                    alt={pet.name}
                    className="size-28 rounded-full object-cover"
                  />
                  <h4 className="mt-3 truncate text-h4 text-black sm:mt-4">
                    {pet.name}
                  </h4>
                  <span className={`badge mt-2 ${BADGE_CLASS[pet.type]}`}>
                    {pet.type}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
