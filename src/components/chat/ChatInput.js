"use client";

import { useEffect, useRef, useState } from "react";
import { normalizeChatImage } from "@/lib/normalizeChatImage";

export default function ChatInput({ value, onChange, onSend, disabled }) {
  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageError, setImageError] = useState("");
  const [preparingImage, setPreparingImage] = useState(false);

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

  async function handlePickImage(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setPreparingImage(true);
    setImageError("");
    try {
      const nextFile = await normalizeChatImage(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setImageFile(nextFile);
      setPreviewUrl(URL.createObjectURL(nextFile));
    } catch (error) {
      setImageError(
        error instanceof Error ? error.message : "Could not attach this photo",
      );
    } finally {
      setPreparingImage(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const sent = await onSend({ imageFile });
    if (sent) clearImage();
  }

  const busy = disabled || preparingImage;
  const canSend = Boolean(value.trim() || imageFile);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col border-t border-gray-200 bg-white px-4 pb-4 pt-3 md:px-10 md:py-6"
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
              disabled={busy}
            >
              <img src="/icon/x.svg" alt="" className="size-3 invert" />
            </button>
          </div>
        </div>
      ) : null}
      {imageError ? (
        <p className="mb-3 text-body-3 text-red">{imageError}</p>
      ) : null}
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
          className="hidden"
          onChange={handlePickImage}
        />
        <button
          type="button"
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-100 disabled:opacity-40"
          aria-label="Attach image"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
        >
          <img src="/icon/gallery.svg" alt="" className="size-6" />
        </button>
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Message here..."
          className="h-8 min-w-0 flex-1 border-0 bg-transparent text-body-3 text-gray-600 outline-none placeholder:text-gray-400"
          disabled={busy}
        />
        <button
          type="submit"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-500 shadow-[2px_2px_12px_rgba(64,50,133,0.12)] disabled:opacity-40"
          aria-label="Send message"
          disabled={busy || !canSend}
        >
          <img src="/icon/send.svg" alt="" className="size-6" />
        </button>
      </div>
    </form>
  );
}
