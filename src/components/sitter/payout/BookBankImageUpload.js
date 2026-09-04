"use client";

import { useRef } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];

/**
 * อัปโหลดรูปสมุดบัญชี — pattern เดียวกับ avatar ใน sitter profile
 * เลือกไฟล์ → preview ทันที · upload จริงทำตอนกดยืนยันใน modal
 */
export default function BookBankImageUpload({
  previewUrl = "",
  onFileSelect,
  error = "",
}) {
  const inputRef = useRef(null);

  function handleChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_SIZE) {
      onFileSelect(null, {
        bookBankImage:
          "Book bank image must be .jpg, .jpeg, or .png and 2MB or smaller",
      });
      return;
    }

    onFileSelect(file, {});
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-body-2 text-black">
        Book Bank Image<span className="text-red">*</span>
      </span>

      <div className="relative w-full max-w-xl">
        <div className="relative flex min-h-48 w-full items-center justify-center overflow-hidden rounded-2xl bg-gray-100">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Book bank preview"
              fill
              unoptimized
              className="object-contain p-4"
            />
          ) : (
            <p className="text-body-3 text-gray-400">Upload book bank image</p>
          )}
        </div>

        <button
          type="button"
          className="btn-secondary absolute right-4 bottom-4 flex size-12 cursor-pointer items-center justify-center rounded-full"
          aria-label="Upload book bank image"
          onClick={() => inputRef.current?.click()}
        >
          <Plus className="size-6" strokeWidth={2.5} aria-hidden="true" />
        </button>

        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          onChange={handleChange}
        />
      </div>

      {error ? <p className="text-body-3 text-red">{error}</p> : null}
    </div>
  );
}
