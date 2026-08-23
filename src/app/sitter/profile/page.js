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
import axios from "axios";
import { toast } from "sonner";
import {
  errorToastClassNames,
  successToastClassNames,
} from "@/lib/toastStyles";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const EXPERIENCE_VALUES = ["0-2", "3-5", "5+"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.com$/i;

const APPROVAL_STYLES = {
  Approved: { text: "text-green", dot: "bg-green" },
  Rejected: { text: "text-red", dot: "bg-red" },
  "Waiting for approve": { text: "text-pink", dot: "bg-pink" },
};

const initialForm = {
  fullName: "",
  experience: "",
  phone: "",
  dateOfBirth: "",
  idNumber: "",
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
  dateOfBirth: "",
  idNumber: "",
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
  const skipAddressSelect = useRef(true); // ถ้าเราเข้าหน้ามาแล้ว province โหลดข้อมูลมาใส่ onValueChange จะทำงานเองทำให้ district, subDistrict ถูกล้าง จึงต้องมีตัวนี้ไว้ skip แค่ตอนเข้า page
  const [form, setForm] = useState(initialForm);
  const [avatarUrl, setAvatarUrl] = useState(""); // เอาไว้โชว์บนจอ (avatar)
  const [imageFile, setImageFile] = useState(null); // เอาไว้ส่งตอนกด update (avatar)
  const [photos, setPhotos] = useState([]); // รุปจาก database ที่จะเอามา map แสดงบนจอ
  const [galleryFiles, setGalleryFiles] = useState([]); // รูปใหม่ที่เลือกแล้วแต่ยังไม่กด Update
  const [deletedPhotoIds, setDeletedPhotoIds] = useState([]); // รูปที่จะถูกลบเมื่อกด update
  const [isSaving, setIsSaving] = useState(false); // สำหรับการบอกว่ากำลังบันทึกข้อมูลอยู่ผ่านทางปุ่ม update
  const [errors, setErrors] = useState(initialErrors);
  const [provinces, setProvinces] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [approvalStatus, setApprovalStatus] = useState("");

  const districts = provinces.find((item) => item.nameEn === form.province)?.districts ?? [];
  const approvalStyle = APPROVAL_STYLES[approvalStatus] ?? APPROVAL_STYLES["Waiting for approve"];

  async function loadSubDistricts(districtId) {
    if (!districtId) {
      setSubDistricts([]);
      return;
    }
    const { data } = await axios.get(
      `https://geoth.thiti.dev/api/districts-with-subdistricts/${districtId}`,
    );
    setSubDistricts(data.subdistricts ?? []);
  }

  async function loadProfile() {
    const { data: json } = await axios.get(`${API_BASE_URL}/api/sitters/me`);
    const profile = json.data;
    const nextForm = {
      fullName: profile.name ?? "",
      experience: profile.experience_years ?? "",
      phone: profile.phone ?? "",
      dateOfBirth: profile.date_of_birth ?? "",
      idNumber: profile.id_number ?? "",
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
    };

    setForm(nextForm);
    setAvatarUrl(profile.avatar_url ?? "");
    setPhotos(profile.sitter_photos ?? []);
    setApprovalStatus(profile.approval_status ?? "");
    return nextForm;
  }

  async function load() {
    skipAddressSelect.current = true;
    try {
      const profile = await loadProfile();
      const { data } = await axios.get(
        "https://geoth.thiti.dev/api/provinces-with-districts/all",
      );
      setProvinces(data);

      const district = data
        .find((item) => item.nameEn === profile?.province)
        ?.districts.find((item) => item.nameEn === profile?.district);
      if (district) {
        await loadSubDistricts(district.id);
      }
    } catch (err) {
      toast(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load profile",
        { classNames: errorToastClassNames },
      );
    } finally {
      // ยังไม่เปิดรับ onValueChange ทันทีที่ API กลับมา
      // รอให้ React วาด dropdown และให้ Radix ยิง event ปลอมจบก่อน แล้วค่อย skipAddressSelect = false
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          skipAddressSelect.current = false;
        });
      });
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleSelectChange(name, value) {
    if (skipAddressSelect.current) {
      return;
    }

    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "province") {
      if (value === form.province) {
        return;
      }
      setForm((current) => ({
        ...current,
        province: value,
        district: "",
        subDistrict: "",
        postCode: "",
      }));
      setSubDistricts([]);
      return;
    }

    if (name === "district") {
      if (value === form.district) {
        return;
      }
      setForm((current) => ({
        ...current,
        district: value,
        subDistrict: "",
        postCode: "",
      }));
      const district = districts.find(
        (item) => item.nameEn === value || item.nameTh === value,
      );
      loadSubDistricts(district?.id);
      return;
    }

    if (name === "subDistrict") {
      const zip = subDistricts.find((item) => item.nameEn === value)?.zipCode;
      setForm((current) => ({
        ...current,
        subDistrict: value,
        postCode: zip ? String(zip) : current.postCode,
      }));
      return;
    }

    // สำหรับตอนเลือก experience
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    event.target.value = ""; // ทำให้ input ว่างเหมือนยังไม่เคยเลือก เพื่อให้รอบหน้าเลือกไฟล์เดิมได้
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

  function handleDeletePhoto(photoId) {
    setPhotos((current) => current.filter((photo) => photo.id !== photoId));
    setDeletedPhotoIds((current) => [...current, photoId]);
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
    } else if (!EMAIL_PATTERN.test(form.email.trim())) {
      newErrors.email = "Email must include @ and end with .com";
    }

    if (!form.idNumber.trim()) {
      newErrors.idNumber = "ID number is required";
    } else if (!/^\d{13}$/.test(form.idNumber.trim())) {
      newErrors.idNumber = "ID number must be 13 digits";
    }

    if (!form.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const today = new Date();
      const minBirthDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate(),
      );
      const birthDate = new Date(`${form.dateOfBirth}T00:00:00`);
      if (birthDate > minBirthDate) {
        newErrors.dateOfBirth = "Pet sitter must be at least 18 years old";
      }
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

    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);

      const formData = new FormData();
      formData.append("name", form.fullName.trim());
      formData.append("phone", form.phone.trim());
      formData.append("date_of_birth", form.dateOfBirth);
      formData.append("display_name", form.tradeName);
      formData.append("introduction", form.introduction);
      formData.append("my_place", form.myPlace);
      formData.append("services", form.services);
      formData.append("address_detail", form.addressDetail);
      formData.append("district", form.district);
      formData.append("sub_district", form.subDistrict);
      formData.append("province", form.province);
      formData.append("post_code", form.postCode);
      formData.append("experience_years", form.experience);
      formData.append("email", form.email.trim());
      formData.append("id_number", form.idNumber.trim());

      form.petTypes.forEach((petType) => {
        formData.append("pet_types", petType);
      });

      if (imageFile) {
        formData.append("imageFile", imageFile);
      }

      galleryFiles.forEach((file) => {
        formData.append("galleryFiles", file);
      });

      const { data: json } = await axios.put(`${API_BASE_URL}/api/sitters/me`, formData);

      for (const id of deletedPhotoIds) {
        await axios.delete(`${API_BASE_URL}/api/sitters/me/photos/${id}`);
      }

      setImageFile(null);
      setGalleryFiles([]);
      setDeletedPhotoIds([]);
      await loadProfile();
      window.dispatchEvent(new Event("sitter-profile-updated"));
      toast(json.message || "Profile updated successfully", {
        classNames: successToastClassNames,
      });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update profile";
      if (message.includes("Phone number is already in use")) {
        setErrors((prev) => ({ ...prev, phone: message }));
      }
      if (message.includes("Email is already in use")) {
        setErrors((prev) => ({ ...prev, email: message }));
      }
      toast(message, {
        classNames: errorToastClassNames,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <h1 className="text-h3 font-bold text-gray-900">Pet Sitter Profile</h1>
          {approvalStatus ? (
            <p className={`flex items-center gap-2 text-body-2 ${approvalStyle.text}`}>
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${approvalStyle.dot}`}
                aria-hidden="true"
              />
              {approvalStatus}
            </p>
          ) : null}
        </div>
        <button
          type="submit"
          className="btn btn-primary min-w-[120px]"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Update"}
        </button>
      </header>

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
              className="btn-secondary absolute right-0 bottom-0 flex h-15 w-15 items-center justify-center rounded-full cursor-pointer"
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
                onChange={handleChange}
              />
            </FormField>
          </div>

          <div className="grid gap-x-10 gap-y-4 md:grid-cols-2">
            <FormField label="Date of Birth" required error={errors.dateOfBirth}>
              <div className="relative">
                {form.dateOfBirth ? null : (
                  <span className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-body-2 text-gray-400">
                    Select your date of birth
                  </span>
                )}
                <input
                  className={`${getInputClassName("dateOfBirth")} pr-12 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 ${
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
            </FormField>

            <FormField label="ID Number" required error={errors.idNumber}>
              <input
                className={getInputClassName("idNumber")}
                type="text"
                name="idNumber"
                value={form.idNumber}
                onChange={handleChange}
                maxLength={13}
                inputMode="numeric"
              />
            </FormField>
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
                  className="absolute top-2 right-2 flex size-6 cursor-pointer items-center justify-center rounded-full bg-gray-400 transition-colors hover:bg-gray-600"
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
                  className="absolute top-2 right-2 flex size-6 cursor-pointer items-center justify-center rounded-full bg-gray-400 transition-colors hover:bg-gray-600"
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
                className="btn-secondary flex size-42 flex-col items-center justify-center gap-2 rounded-xl cursor-pointer"
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
                  {provinces.map((province) => (
                    <SelectItem key={province.id} value={province.nameEn}>
                      {province.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

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
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.nameEn}>
                      {district.nameEn}
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
                  {subDistricts.map((subDistrict) => (
                    <SelectItem key={subDistrict.id} value={subDistrict.nameEn}>
                      {subDistrict.nameEn}
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
    <div className="flex flex-col gap-1">
      <span className="text-body-2 text-black">
        {label}
        {required && <span className="text-red">*</span>}
      </span>
      {children}
      {error && <p className="text-body-3 text-red">{error}</p>}
    </div>
  );
}
