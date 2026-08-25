"use client";

import { useEffect, useRef, useState } from "react";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];

export default function ChatInput({ value, onChange, onSend, disabled }) {
  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function clearImage() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl("");
    setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handlePickImage(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Image must be .jpg, .jpeg, or .png");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Image must be 2MB or smaller");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageError("");
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const sent = await onSend({ imageFile });
    if (sent) clearImage();
  }

  const canSend = Boolean(value.trim() || imageFile);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col border-t border-gray-200 bg-white px-10 py-6"
    >
      {previewUrl ? (
        <div className="mb-4 flex items-start gap-3">
          <div className="relative">
            <img
              src={previewUrl}
              alt="Selected"
              className="h-20 w-20 rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-gray-900 text-white"
              aria-label="Remove image"
              disabled={disabled}
            >
              <img src="/icon/x.svg" alt="" className="size-3 invert" />
            </button>
          </div>
        </div>
      ) : null}
      {imageError ? (
        <p className="mb-3 text-body-3 text-red">{imageError}</p>
      ) : null}
      <div className="flex items-center gap-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handlePickImage}
        />
        <button
          type="button"
          className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-100 disabled:opacity-40"
          aria-label="Attach image"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
        >
          <img src="/icon/gallery.svg" alt="" className="size-6" />
        </button>
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Message here..."
          className="h-12 min-w-0 flex-1 border-0 bg-transparent text-body-2 text-black outline-none placeholder:text-gray-400"
          disabled={disabled}
        />
        <button
          type="submit"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-orange-500 disabled:opacity-40"
          aria-label="Send message"
          disabled={disabled || !canSend}
        >
          <img src="/icon/send.svg" alt="" className="size-6" />
        </button>
      </div>
    </form>
  );
}
