"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, UserRound, CirclePlus, Calendar, X } from "lucide-react";
import PetTypeSelect from "@/components/PetTypeSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const EXPERIENCE_VALUES = ["0-2", "3-5", "5+"];
const PROVINCES = [
  "Bangkok",
  "Chiang Mai",
  "Chonburi",
  "Phuket",
  "Nonthaburi",
  "Pathum Thani",
  "Samut Prakan",
  "Khon Kaen",
  "Nakhon Ratchasima",
  "Songkhla",
];
const DISTRICTS = [
  "Pathum Wan",
  "Watthana",
  "Chatuchak",
  "Bang Rak",
  "Mueang Chiang Mai",
  "Bang Lamung",
  "Mueang Phuket",
  "Kathu",
  "Mueang Nonthaburi",
  "Mueang Samut Prakan",
];
const SUB_DISTRICTS = [
  "Lumphini",
  "Si Lom",
  "Khlong Toei",
  "Chang Khlan",
  "Patong",
  "Si Sunthon",
  "Nong Prue",
  "Bang Sao Thong",
];

const initialForm = {
  fullName: "",
  experience: "",
  phone: "",
  dateOfBirth: "",
  email: "",
  introduction: "",
  tradeName: "",
  petTypes: [],
  services: "",
  myPlace: "",
  addressDetail: "",
  district: "",
  subDistrict: "",
  province: "",
  postCode: "",
};

const initialErrors = {
  avatar: "",
  fullName: "",
  experience: "",
  phone: "",
  email: "",
  tradeName: "",
  petTypes: "",
  gallery: "",
  addressDetail: "",
  district: "",
  subDistrict: "",
  province: "",
  postCode: "",
};

export default function PetSitterProfilePage() {
  const avatarInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState(initialErrors);

  async function loadProfile() {
    const token = getToken();
    if (!token) {
      return;
    }

    const response = await fetch(`${API_URL}/api/sitters/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.message || json.error || "Failed to load profile");
    }

    const profile = json.data;
    setForm({
      fullName: profile.name ?? "",
      experience: profile.experience_years ?? "",
      phone: profile.phone ?? "",
      dateOfBirth: profile.date_of_birth ?? "",
      email: profile.email ?? "",
      introduction: profile.introduction ?? "",
      tradeName: profile.display_name ?? "",
      petTypes: (profile.pet_types ?? []).map((item) => item.name.toLowerCase()),
      services: profile.services ?? "",
      myPlace: profile.my_place ?? "",
      addressDetail: profile.address_detail ?? "",
      district: profile.district ?? "",
      subDistrict: profile.sub_district ?? "",
      province: profile.province ?? "",
      postCode: profile.post_code ?? "",
    });
    setAvatarUrl(profile.avatar_url ?? "");
    setPhotos(profile.sitter_photos ?? []);
  }

  useEffect(() => {
    loadProfile().catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    });
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleSelectChange(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        avatar: "Profile image must be .jpg, .jpeg, or .png and 2MB or smaller",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, avatar: "" }));
    setImageFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  }

  function handleGalleryChange(event) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    const remaining = 10 - photos.length - galleryFiles.length;
    const validFiles = files
      .filter(
        (file) =>
          ALLOWED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_SIZE,
      )
      .slice(0, remaining);

    if (validFiles.length !== files.length) {
      setErrors((prev) => ({
        ...prev,
        gallery:
          "Gallery images must be .jpg, .jpeg, or .png, 2MB or smaller, and max 10",
      }));
    } else {
      setErrors((prev) => ({ ...prev, gallery: "" }));
    }

    if (validFiles.length > 0) {
      setGalleryFiles((current) => [...current, ...validFiles]);
    }
  }

  async function handleDeletePhoto(photoId) {
    const token = getToken();
    if (!token) {
      return;
    }

    const response = await fetch(`${API_URL}/api/sitters/me/photos/${photoId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await response.json();

    if (!response.ok) {
      setError(json.message || "Failed to delete photo");
      return;
    }

    setPhotos((current) => current.filter((photo) => photo.id !== photoId));
  }

  function handleRemoveGalleryFile(index) {
    setGalleryFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  }

  function validateForm() {
    const newErrors = { ...initialErrors };

    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (form.fullName.trim().length < 6 || form.fullName.trim().length > 20) {
      newErrors.fullName = "Full name must be 6-20 characters";
    }

    if (!form.experience) {
      newErrors.experience = "Experience is required";
    } else if (!EXPERIENCE_VALUES.includes(form.experience)) {
      newErrors.experience = "Please select a valid experience";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^0\d{9}$/.test(form.phone.trim())) {
      newErrors.phone = "Phone number must be 10 digits and start with 0";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !form.email.includes("@") ||
      !form.email.toLowerCase().includes(".com")
    ) {
      newErrors.email = "Email must contain @ and .com";
    }

    if (!form.tradeName.trim()) {
      newErrors.tradeName = "Pet sitter name is required";
    }

    if (form.petTypes.length === 0) {
      newErrors.petTypes = "Please select at least one pet type";
    }

    if (photos.length + galleryFiles.length > 10) {
      newErrors.gallery = "Image gallery allows a maximum of 10 images";
    }

    if (!form.addressDetail.trim()) {
      newErrors.addressDetail = "Address detail is required";
    }

    if (!form.district.trim()) {
      newErrors.district = "District is required";
    }

    if (!form.subDistrict.trim()) {
      newErrors.subDistrict = "Sub-district is required";
    }

    if (!form.province.trim()) {
      newErrors.province = "Province is required";
    }

    if (!form.postCode.trim()) {
      newErrors.postCode = "Post code is required";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  }

  function getInputClassName(field) {
    return `input ${errors[field] ? "input-error" : ""}`;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    const token = getToken();
    if (!token) {
      return;
    }

    try {
      setIsSaving(true);

      const formData = new FormData();
      formData.append("name", form.fullName.trim());
      formData.append("phone", form.phone.trim());
      if (form.dateOfBirth) {
        formData.append("date_of_birth", form.dateOfBirth);
      }
      formData.append("display_name", form.tradeName);
      formData.append("introduction", form.introduction);
      formData.append("my_place", form.myPlace);
      formData.append("services", form.services);
      formData.append("address_detail", form.addressDetail);
      formData.append("district", form.district);
      formData.append("sub_district", form.subDistrict);
      formData.append("province", form.province);
      formData.append("post_code", form.postCode);

      if (form.experience) {
        formData.append("experience_years", form.experience);
      }

      form.petTypes.forEach((petType) => {
        formData.append("pet_types", petType);
      });

      if (imageFile) {
        formData.append("imageFile", imageFile);
      }

      galleryFiles.forEach((file) => {
        formData.append("galleryFiles", file);
      });

      const response = await fetch(`${API_URL}/api/sitters/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || json.error || "Failed to update profile");
      }

      setImageFile(null);
      setGalleryFiles([]);
      await loadProfile();
      window.dispatchEvent(new Event("sitter-profile-updated"));
      setSuccess(json.message || "Profile updated successfully");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile";
      if (message.includes("Phone number is already in use")) {
        setErrors((prev) => ({ ...prev, phone: message }));
      }
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <h1 className="text-h3 font-bold text-gray-900">Pet Sitter Profile</h1>
          <p className="flex items-center gap-2 text-body-2 text-green">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-green"
              aria-hidden="true"
            />
            Approved
          </p>
        </div>
        <button
          type="submit"
          className="btn btn-primary min-w-[120px]"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Update"}
        </button>
      </header>

      {error ? <p className="text-body-2 text-red">{error}</p> : null}
      {success ? <p className="text-body-2 text-green">{success}</p> : null}

      <section
        className="flex flex-col gap-6 rounded-2xl bg-white px-20 py-10"
        aria-labelledby="basic-info-title"
      >
        <h2 id="basic-info-title" className="text-h4 text-gray-300">
          Basic Information
        </h2>

        <div className="flex flex-col gap-4">
          <p className="text-body-2 text-black">Profile Image</p>
          <div className="relative w-fit">
            <div className="flex h-60 w-60 items-center justify-center overflow-hidden rounded-full bg-gray-200">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Pet sitter profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound className="h-26 w-26 text-white" />
              )}
            </div>
            <button
              type="button"
              className="absolute right-0 bottom-0 flex h-15 w-15 items-center justify-center rounded-full bg-orange-100 text-orange-500"
              aria-label="Upload profile photo"
              onClick={() => avatarInputRef.current?.click()}
            >
              <Plus className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
            </button>
            <input
              ref={avatarInputRef}
              className="hidden"
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={handleAvatarChange}
            />
          </div>
          {errors.avatar && (
            <p className="text-body-3 text-red">{errors.avatar}</p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid gap-x-10 gap-y-4 md:grid-cols-2">
            <FormField label="Your full name" required error={errors.fullName}>
              <input
                className={getInputClassName("fullName")}
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                maxLength={20}
              />
            </FormField>

            <FormField label="Experience" required error={errors.experience}>
              <Select
                value={form.experience || undefined}
                onValueChange={(value) => handleSelectChange("experience", value)}
              >
                <SelectTrigger
                  className={errors.experience ? "input-error" : ""}
                >
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-2">0-2 Years</SelectItem>
                  <SelectItem value="3-5">3-5 Years</SelectItem>
                  <SelectItem value="5+">5+ Years</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="grid gap-x-10 gap-y-4 md:grid-cols-2">
            <FormField label="Phone Number" required error={errors.phone}>
              <input
                className={getInputClassName("phone")}
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                maxLength={10}
              />
            </FormField>

            <FormField label="Email" required error={errors.email}>
              <input
                className={getInputClassName("email")}
                type="email"
                name="email"
                value={form.email}
                readOnly
              />
            </FormField>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-body-2 text-black">Date of Birth</p>
            <div className="relative">
              {form.dateOfBirth ? null : (
                <span className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-body-2 text-gray-400">
                  Select your date of birth
                </span>
              )}
              <input
                className={`input pr-12 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 ${
                  form.dateOfBirth ? "" : "text-transparent"
                }`}
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
              />
              <Calendar
                className="pointer-events-none absolute top-1/2 right-3 h-6 w-6 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
            </div>
          </div>

          <FormField label="Introduction (Describe about yourself as pet sitter)">
            <textarea
              className="input min-h-[120px] resize-y"
              name="introduction"
              value={form.introduction}
              onChange={handleChange}
            />
          </FormField>
        </div>
      </section>

      <section
        className="flex flex-col gap-6 rounded-2xl bg-white px-20 py-10"
        aria-labelledby="pet-sitter-title"
      >
        <h2 id="pet-sitter-title" className="text-h4 text-gray-300">
          Pet Sitter
        </h2>

        <FormField label="Pet sitter name (Trade Name)" required error={errors.tradeName}>
          <input
            className={getInputClassName("tradeName")}
            type="text"
            name="tradeName"
            value={form.tradeName}
            onChange={handleChange}
          />
        </FormField>

        <div className="flex flex-col gap-1">
          <p className="text-body-2 text-black">
            Pet type<span className="text-red">*</span>
          </p>
          <PetTypeSelect
            value={form.petTypes}
            error={errors.petTypes}
            onChange={(petTypes) => {
              setForm((current) => ({ ...current, petTypes }));
              setErrors((prev) => ({ ...prev, petTypes: "" }));
            }}
          />
          {errors.petTypes && (
            <p className="text-body-3 text-red">{errors.petTypes}</p>
          )}
        </div>

        <FormField label="Services (Describe all of your service for pet sitting)">
          <textarea
            className="input min-h-[120px] resize-y"
            name="services"
            value={form.services}
            onChange={handleChange}
          />
        </FormField>

        <FormField label="My Place (Describe you place)">
          <textarea
            className="input min-h-[120px] resize-y"
            name="myPlace"
            value={form.myPlace}
            onChange={handleChange}
          />
        </FormField>

        <div className="flex flex-col gap-3">
          <p className="text-body-2 text-black">
            Image Gallery (Maximum 10 images)
          </p>
          <div className="flex flex-wrap gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative size-42 overflow-hidden rounded-xl">
                <img
                  src={photo.photo_url}
                  alt="Gallery photo"
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-gray-400"
                  aria-label="Delete photo"
                  onClick={() => handleDeletePhoto(photo.id)}
                >
                  <X className="size-3.5 text-white" strokeWidth={2.5} aria-hidden="true" />
                </button>
              </div>
            ))}
            {galleryFiles.map((file, index) => (
              <div
                key={file.name + file.lastModified}
                className="relative size-42 overflow-hidden rounded-xl"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt="New gallery photo"
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-gray-400"
                  aria-label="Remove photo"
                  onClick={() => handleRemoveGalleryFile(index)}
                >
                  <X className="size-3.5 text-white" strokeWidth={2.5} aria-hidden="true" />
                </button>
              </div>
            ))}
            {photos.length + galleryFiles.length < 10 ? (
              <button
                type="button"
                className="flex size-42 flex-col items-center justify-center gap-2 rounded-xl bg-orange-100 text-orange-500"
                aria-label="Upload Image"
                onClick={() => galleryInputRef.current?.click()}
              >
                <CirclePlus className="size-10" strokeWidth={1.5} aria-hidden="true" />
                <span className="text-body-2">Upload Image</span>
              </button>
            ) : null}
            <input
              ref={galleryInputRef}
              className="hidden"
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              multiple
              onChange={handleGalleryChange}
            />
          </div>
          {errors.gallery && (
            <p className="text-body-3 text-red">{errors.gallery}</p>
          )}
        </div>
      </section>

      <section
        className="flex flex-col gap-6 rounded-2xl bg-white px-20 py-10"
        aria-labelledby="address-title"
      >
        <h2 id="address-title" className="text-h4 text-gray-300">
          Address
        </h2>

        <div className="flex flex-col gap-4">
          <FormField label="Address detail" required error={errors.addressDetail}>
            <input
              className={getInputClassName("addressDetail")}
              type="text"
              name="addressDetail"
              value={form.addressDetail}
              onChange={handleChange}
            />
          </FormField>

          <div className="grid gap-x-10 gap-y-4 md:grid-cols-2">
            <FormField label="District" required error={errors.district}>
              <Select
                value={form.district || undefined}
                onValueChange={(value) => handleSelectChange("district", value)}
              >
                <SelectTrigger
                  className={errors.district ? "input-error" : ""}
                >
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {DISTRICTS.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Sub-district" required error={errors.subDistrict}>
              <Select
                value={form.subDistrict || undefined}
                onValueChange={(value) =>
                  handleSelectChange("subDistrict", value)
                }
              >
                <SelectTrigger
                  className={errors.subDistrict ? "input-error" : ""}
                >
                  <SelectValue placeholder="Select sub-district" />
                </SelectTrigger>
                <SelectContent>
                  {SUB_DISTRICTS.map((subDistrict) => (
                    <SelectItem key={subDistrict} value={subDistrict}>
                      {subDistrict}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="grid gap-x-10 gap-y-4 md:grid-cols-2">
            <FormField label="Province" required error={errors.province}>
              <Select
                value={form.province || undefined}
                onValueChange={(value) => handleSelectChange("province", value)}
              >
                <SelectTrigger
                  className={errors.province ? "input-error" : ""}
                >
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Post code" required error={errors.postCode}>
              <input
                className={getInputClassName("postCode")}
                type="text"
                name="postCode"
                value={form.postCode}
                onChange={handleChange}
              />
            </FormField>
          </div>
        </div>

        <div
          className="flex h-56 items-center justify-center rounded-xl bg-gray-200 text-body-2 text-gray-400"
          role="img"
          aria-label="Map preview"
        >
          Map preview
        </div>
      </section>
    </form>
  );
}

function FormField({ label, required, error, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-body-2 text-black">
        {label}
        {required ? <span className="text-red">*</span> : null}
      </span>
      {children}
      {error && <p className="text-body-3 text-red">{error}</p>}
    </label>
  );
}
