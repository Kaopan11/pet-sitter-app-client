"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, PawPrint } from "lucide-react";
import AccountSidebar from "@/components/AccountSidebar";
import { toast } from "sonner";
import { createPet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { validatePetProfile } from "../../../../utils/validatePetProfile";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const PET_TYPES = ["Dog", "Cat", "Bird", "Rabbit"];



export default function OwnerPetsCreatePage() {
  const router = useRouter();
  const imageInputRef = useRef(null);
  const [name, setName] = useState("");
  const [petType, setPetType] = useState("");
  const [breed, setBreed] = useState("");
  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [color, setColor] = useState("");
  const [weight, setWeight] = useState("");
  const [about, setAbout] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        image: "Pet image must be .jpg, .jpeg, or .png and 2MB or smaller",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, image: "" }));
    setImageFile(file);
    setImageUrl((current) => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!getToken()) {
      router.replace("/login/owner");//if not log-in will take user to log-in page
      return;
      //stop reading other lines 
    }

    const nextErrors = validatePetProfile({
      name,
      petType,
      breed,
      sex,
      age,
      color,
      weight,});
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const formData = new FormData();
      formData.append("name", name.trim()); //"name"is key in object, value: name.trim() which is state
      formData.append("pet_type", petType);
      formData.append("breed", breed.trim());
      formData.append("sex", sex);
      formData.append("age", age.trim());
      formData.append("color", color.trim());
      formData.append("weight", weight.trim());
      formData.append("about", about.trim());

      if (imageFile) {
        formData.append("avatar", imageFile);
      }

      await createPet(formData);

      if (imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }

      toast.success("Pet created successfully");
      router.push("/owner/pets");
    } catch (error) {
      if (error.message === "NO_TOKEN" || error.message === "Unauthorized") {
        router.replace("/login/owner");
        return;
      }
      toast.error(error.message || "Failed to create pet");
    }
  }
  

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="mx-4 mt-6 flex w-full min-w-0 flex-col pb-8 sm:mx-6 lg:mx-10">
        <nav
          aria-label="Breadcrumb"
          className="mb-2 text-body-3 text-gray-400 lg:px-4"
        >
          <span>Pet</span>
          <span className="mx-1">{">"}</span>
          <span className="text-black">Create</span>
        </nav>

        <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:justify-center lg:gap-0">
          <AccountSidebar />

          <div className="card flex w-full flex-col p-4 sm:p-6 lg:m-4 lg:ml-6 lg:min-h-222 lg:w-2/3 lg:p-10">
            <h3 className="text-h3">Your Pet</h3>

            <div className="mx-4 my-8">
              <div className="relative my-8 w-fit shrink-0 self-start">
                <div className="relative size-60 shrink-0 overflow-hidden rounded-full bg-gray-200">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Pet"
                      className="h-full w-full max-w-none object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <PawPrint
                        className="size-24 text-white"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-secondary absolute right-1 bottom-1 flex size-10 cursor-pointer items-center justify-center rounded-full"
                  aria-label="Upload pet photo"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Plus className="size-5" strokeWidth={2.5} aria-hidden="true" />
                </button>
                <input
                  ref={imageInputRef}
                  className="hidden"
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  onChange={handleImageChange}
                />
              </div>
              {errors.image && (
                <p className="mt-2 text-body-3 text-red-500">{errors.image}</p>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-1 flex-col gap-6"
            >
              <label className="flex flex-col gap-1">
                <span className="text-body-3 font-bold text-black">
                  Pet Name <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={`input ${errors.name ? "border-red-500" : ""}`}
                  placeholder="Your pet name"
                />
                {errors.name && (
                  <p className="text-body-3 text-red-500">{errors.name}</p>
                )}
              </label>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-body-3 font-bold text-black">
                  Pet Type <span className="text-red-500">*</span>
                </span>
                <select
                  name="petType"
                  value={petType}
                  onChange={(event) => {
                    setPetType(event.target.value);
                    setErrors((prev) => ({ ...prev, petType: "" }));
                  }}
                  className={`input ${errors.petType ? "border-red-500" : ""} ${
                    petType ? "" : "text-gray-400"
                  }`}
                >
                  <option value="" disabled>
                    Select pet type
                  </option>
                  {PET_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.petType && (
                  <p className="text-body-3 text-red-500">{errors.petType}</p>
                )}
              </label>
                <label className="flex flex-col gap-1">
                  <span className="text-body-3 font-bold text-black">
                    Breed <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    name="breed"
                    value={breed}
                    onChange={(event) => setBreed(event.target.value)}
                    className={`input ${errors.breed ? "border-red-500" : ""}`}
                    placeholder="Breed of your pet"
                  />
                  {errors.breed && (
                    <p className="text-body-3 text-red-500">{errors.breed}</p>
                  )}
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-body-3 font-bold text-black">
                    Sex <span className="text-red-500">*</span>
                  </span>
                  <select
                    name="sex"
                    value={sex}
                    onChange={(event) => setSex(event.target.value)}
                    className={`input ${errors.sex ? "border-red-500" : ""} ${
                      sex ? "" : "text-gray-400"
                    }`}
                  >
                    <option value="" disabled>
                      Select sex of your pet
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {errors.sex && (
                    <p className="text-body-3 text-red-500">{errors.sex}</p>
                  )}
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-body-3 font-bold text-black">
                    Age (Month) <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    name="age"
                    inputMode="decimal"
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                    className={`input ${errors.age ? "border-red-500" : ""}`}
                    placeholder="0"
                  />
                  {errors.age && (
                    <p className="text-body-3 text-red-500">{errors.age}</p>
                  )}
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-body-3 font-bold text-black">
                    Color <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    name="color"
                    value={color}
                    onChange={(event) => setColor(event.target.value)}
                    className={`input ${errors.color ? "border-red-500" : ""}`}
                    placeholder="Describe color of your pet"
                  />
                  {errors.color && (
                    <p className="text-body-3 text-red-500">{errors.color}</p>
                  )}
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-body-3 font-bold text-black">
                    Weight (Kilogram) <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    name="weight"
                    inputMode="decimal"
                    value={weight}
                    onChange={(event) => setWeight(event.target.value)}
                    className={`input ${errors.weight ? "border-red-500" : ""}`}
                    placeholder="0"
                  />
                  {errors.weight && (
                    <p className="text-body-3 text-red-500">{errors.weight}</p>
                  )}
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-body-3 font-bold text-black">About</span>
                <textarea
                  name="about"
                  value={about}
                  onChange={(event) => setAbout(event.target.value)}
                  className="input min-h-30 resize-y"
                  placeholder="Describe more about your pet..."
                />
              </label>

              <div className="mt-auto flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
                <Link href="/owner/pets" className="btn btn-secondary w-full sm:w-auto">
                  Cancel
                </Link>
                <button type="submit" className="btn btn-primary w-full sm:w-auto">
                  Create Pet
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
