"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, UserRound } from "lucide-react";
import AccountSidebar from "../../../components/AccountSidebar";
import { validateProfile } from "../../../utils/validateProfile"; 
import { toast } from "sonner";
import { getToken, getUser, updateStoredUser } from "@/lib/auth"; //ดึงฟังก์ชันที่เกี่ยวกับ login จากไฟล์ src/lib/auth.js มาใช้ในหน้าโปรไฟล์
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];

function toDateInputValue(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

async function ownerProfileRequest(method, body) {
  const token = getToken();
  if (!token) {
    throw new Error("NO_TOKEN");
  }
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(`${API_URL}/api/users/me`, {
    method,
    cache: "no-store",
    headers,
    body,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      json.message || json.error || `Request failed (${res.status})`,
    );
  }
  return json.data;
}

function fetchOwnerProfile() {
  return ownerProfileRequest("GET");
}

function updateOwnerProfile(formData) {
  return ownerProfileRequest("PUT", formData);
}

function persistUpdatedUser(profile) {
  updateStoredUser({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    avatarUrl: profile.avatar_url ?? profile.avatarUrl,
  });
  window.dispatchEvent(new Event("owner-profile-updated"));
}

export default function OwnerProfilePage() {
  const router = useRouter();
  const avatarInputRef = useRef(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");

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
    setAvatarUrl((current) => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }


  // โหลดข้อมูลโปรไฟล์
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!getToken()) {
        router.replace("/login/owner");
        return;
      }

      const cached = getUser(); //อ่าน user จาก localStorage / sessionStorage ไม่ยิงเซิร์ฟเวอร์
      if (cached) {
        setName(cached.name ?? "");
        setEmail(cached.email ?? "");
        setPhone(cached.phone ?? "");
        setAvatarUrl(cached.avatarUrl ?? cached.avatar_url ?? "");
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }

      setLoadError("");

      try {
        const profile = await fetchOwnerProfile();
        if (cancelled || !profile) return;

        setName(profile.name ?? "");
        setEmail(profile.email ?? "");
        setPhone(profile.phone ?? "");
        setIdNumber(profile.id_number ?? "");
        setDateOfBirth(toDateInputValue(profile.date_of_birth));
        setAvatarUrl(profile.avatar_url ?? "");
      } catch (error) {
        if (cancelled) return;
        if (error.message === "NO_TOKEN" || error.message === "Unauthorized") {
          router.replace("/login/owner");
          return;
        }
        setLoadError(error.message || "Failed to load profile");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError(""); 

    if (!getToken()) {
      router.replace("/login/owner");
      return;
    }

    const nextErrors = validateProfile({
      name,
      email,
      phone,
      idNumber,
      dateOfBirth,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      formData.append("id_number", idNumber.trim());
      formData.append("date_of_birth", dateOfBirth);

      if (imageFile) {
        formData.append("avatar", imageFile);
      } else if (avatarUrl && !avatarUrl.startsWith("blob:")) {
        formData.append("avatar_url", avatarUrl);
      }

      const profile = await updateOwnerProfile(formData);

      if (avatarUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarUrl);
      }

      setAvatarUrl(profile.avatar_url ?? "");
      setImageFile(null);
      persistUpdatedUser(profile);
      toast.success("Profile updated successfully");
    } catch (error) {
      if (error.message === "NO_TOKEN" || error.message === "Unauthorized") {
        router.replace("/login/owner");
        return;
      }
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex h-full bg-gray-100">
      <div className="mx-10 mt-6 flex w-full flex-row justify-center">
        <AccountSidebar />

        <div className="card m-4 ml-6 flex min-h-[888px] w-2/3 flex-col p-10">
          <h3 className="text-h3">Profile</h3>

          {loadError && (
            <p className="mt-4 text-body-3 text-red-500">{loadError}</p>
          )}
          {submitError && (
            <p className="mt-4 text-body-3 text-red-500">{submitError}</p>
          )}
          {success && (
            <p className="mt-4 text-body-3 text-green">{success}</p>
          )}

          <div className="mx-4 my-8">
          <div className="relative my-8 w-fit self-start">
          <div className="relative size-60 overflow-hidden rounded-full bg-gray-200">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Owner profile"
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                <UserRound className="size-24 text-white" aria-hidden="true" />
              </div>
              )}
            </div>
            <button
              type="button"
              className="btn-secondary absolute right-1 bottom-1 flex size-10 cursor-pointer items-center justify-center rounded-full disabled:cursor-not-allowed"
              aria-label="Upload profile photo"
              onClick={() => avatarInputRef.current?.click()}
              disabled={isLoading || isSaving}
            >
              <Plus className="size-5" strokeWidth={2.5} aria-hidden="true" />
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
              <p className="mt-2 text-body-3 text-red-500">{errors.avatar}</p>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-1 flex-col gap-6"
          >
            <label className="flex flex-col gap-1">
              <span className="text-body-3 font-bold text-black">
                Your Name <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={`input ${errors.name ? "border-red-500" : ""}`}
                placeholder="Please enter your name"
                disabled={isLoading || isSaving}
              />
              {errors.name && (
                <p className="text-body-3 text-red-500">{errors.name}</p>
              )}
            </label>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-body-3 font-bold text-black">
                  Email <span className="text-red-500">*</span>
                </span>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={`input ${errors.email ? "border-red-500" : ""}`}
                  placeholder="example@email.com"
                  disabled={isLoading || isSaving}
                />
                {errors.email && (
                  <p className="text-body-3 text-red-500">{errors.email}</p>
                )}
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-body-3 font-bold text-black">
                  Phone <span className="text-red-500">*</span>
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={`input ${errors.phone ? "border-red-500" : ""}`}
                  placeholder="Please enter your phone number"
                  disabled={isLoading || isSaving}
                />
                {errors.phone && (
                  <p className="text-body-3 text-red-500">{errors.phone}</p>
                )}
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-body-3 font-bold text-black">
                  ID Number <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  name="idNumber"
                  value={idNumber}
                  onChange={(event) => setIdNumber(event.target.value)}
                  className={`input ${errors.idNumber ? "border-red-500" : ""}`}
                  placeholder="Your ID number"
                  disabled={isLoading || isSaving}
                />
                {errors.idNumber && (
                  <p className="text-body-3 text-red-500">{errors.idNumber}</p>
                )}
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-body-3 font-bold text-black">
                  Date of Birth <span className="text-red-500">*</span>
                </span>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={dateOfBirth}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                  className={`input ${errors.dateOfBirth ? "border-red-500" : ""}`}
                  disabled={isLoading || isSaving}
                />
                {errors.dateOfBirth && (
                  <p className="text-body-3 text-red-500">
                    {errors.dateOfBirth}
                  </p>
                )}
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || isSaving}
              >
                {isSaving ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
