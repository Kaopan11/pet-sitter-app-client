"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus, PawPrint, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { validatePetProfile } from "@/utils/validatePetProfile";
import { deletePet, updatePet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import DeletePetModal from "./DeletePetModal";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const PET_TYPES = ["Dog", "Cat", "Bird", "Rabbit"];

export default function PetDetailForm({ pet }) {
  const router = useRouter();
  const imageInputRef = useRef(null);
  const [name, setName] = useState(pet.name);
  const [petType, setPetType] = useState(pet.type);
  const [breed, setBreed] = useState(pet.breed);
  const [sex, setSex] = useState(pet.sex);
  const [age, setAge] = useState(pet.age);
  const [color, setColor] = useState(pet.color);
  const [weight, setWeight] = useState(pet.weight);
  const [about, setAbout] = useState(pet.about);
  const [imageUrl, setImageUrl] = useState(pet.image);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    setName(pet.name);
    setPetType(pet.type);
    setBreed(pet.breed);
    setSex(pet.sex);
    setAge(pet.age);
    setColor(pet.color);
    setWeight(pet.weight);
    setAbout(pet.about);
    setImageUrl((current) => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
      return pet.image;
    });
    setImageFile(null);
    setErrors({});
  }, [pet]);

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (
      !ALLOWED_IMAGE_TYPES.includes(file.type) ||
      file.size > MAX_IMAGE_SIZE
    ) {
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
    if (isUpdating) return;

    if (!getToken()) {
      router.replace("/login/owner");
      return;
    }

    const nextErrors = validatePetProfile({
      name,
      petType,
      breed,
      sex,
      age,
      color,
      weight,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsUpdating(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
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

      await updatePet(pet.id, formData);

      if (imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }

      toast.success("Pet updated successfully");
      router.push("/owner/pets");
    } catch (error) {
      if (error.message === "NO_TOKEN" || error.message === "Unauthorized") {
        router.replace("/login/owner");
        return;
      }
      toast.error(error.message || "Failed to update pet");
    } finally {
      setIsUpdating(false);
    }
  }

  function openDeleteModal() {
    setDeleteError("");
    setIsDeleteOpen(true);
  }

  function closeDeleteModal() {
    if (isDeleting) return;
    setIsDeleteOpen(false);
    setDeleteError("");
  }

  async function handleDeletePet() {
    if (!getToken()) {
      router.replace("/login/owner");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      await deletePet(pet.id);
      toast.success("Pet deleted successfully");
      setIsDeleteOpen(false);
      router.push("/owner/pets");
    } catch (error) {
      if (error.message === "NO_TOKEN" || error.message === "Unauthorized") {
        router.replace("/login/owner");
        return;
      }
      setDeleteError(error.message || "Failed to delete pet");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="card flex w-full flex-col p-4 sm:p-6 lg:m-4 lg:ml-6 lg:min-h-[888px] lg:w-2/3 lg:p-10">
      <Link
        href="/owner/pets"
        className="flex w-fit items-center gap-2 text-h3"
      >
        <ChevronLeft
          className="size-6 shrink-0 text-gray-400"
          strokeWidth={2.5}
          aria-hidden="true"
        />
        <span className="text-black">Your Pet</span>
      </Link>

      <div className="mx-4 my-8">
        <div className="relative my-8 w-fit shrink-0 self-start">
          <div className="relative size-60 shrink-0 overflow-hidden rounded-full bg-gray-200">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name || "Pet"}
                className="h-full w-full max-w-none object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <PawPrint className="size-24 text-white" aria-hidden="true" />
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
            className="input min-h-[120px] resize-y"
            placeholder="Describe more about your pet..."
          />
        </label>

        <button
          type="button"
          onClick={openDeleteModal}
          className="flex w-fit cursor-pointer items-center gap-2 text-body-2 font-bold text-orange-500 hover:text-orange-400"
        >
          <Trash2 className="size-5" strokeWidth={2} aria-hidden="true" />
          Delete Pet
        </button>

        <div className="mt-auto flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
          <Link
            href="/owner/pets"
            className="btn btn-secondary w-full sm:w-auto"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isUpdating}
            className="btn btn-primary w-full sm:w-auto"
          >
            {isUpdating ? "Updating..." : "Update Pet"}
          </button>
        </div>
      </form>

      <DeletePetModal
        open={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeletePet}
        submitting={isDeleting}
        error={deleteError}
      />
    </div>
  );
}
