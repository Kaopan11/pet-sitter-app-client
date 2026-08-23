import Link from "next/link";
import AccountSidebar from "../../../components/AccountSidebar";

const PETS = [
    {
      id: "1",
      name: "Bubba",
      type: "Dog",
      image: "/image/dog1.jpg",
    },
    {
      id: "2",
      name: "Daisy",
      type: "Dog",
      image: "/image/dog2.jpg",
    },
    {
      id: "3",
      name: "I Som",
      type: "Cat",
      image: "/image/cat.jpg",
    },
    {
      id: "4",
      name: "Noodle Birb",
      type: "Bird",
      image: "/image/bird.jpg",
    },
  ];

const BADGE_CLASS = {
  Dog: "badge-dog",
  Cat: "badge-cat",
  Bird: "badge-bird",
};

export default function OwnerPetsPage() {
  return (
    <div className="min-h-full bg-gray-100">
      <div className="mx-10 mt-6 flex w-full flex-col justify-center">
        <nav
          aria-label="Breadcrumb"
          className="mb-2 px-4 text-body-3 text-gray-400"
        >
          <span>Account</span>
          <span className="mx-1">&gt;</span>
          <span>Pet list</span>
        </nav>

        <div className="flex w-full flex-row justify-center">
          <AccountSidebar />

          <section className="card m-4 ml-6 flex min-h-[888px] w-2/3 flex-col p-10">
            <div className="flex items-center justify-between">
              <h3 className="text-h3">Your Pet</h3>
              <Link href="/owner/pets/create" className="btn btn-primary">
                Create Pet
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {PETS.map((pet) => (
                <article
                  key={pet.id}
                  className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white px-6 py-8"
                >
                  <img
                    src={pet.image}
                    alt={pet.name}
                    className="size-28 rounded-full object-cover"
                  />
                  <h4 className="mt-4 text-h4 text-black">{pet.name}</h4>
                  <span className={`badge mt-2 ${BADGE_CLASS[pet.type]}`}>
                    {pet.type}
                  </span>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}