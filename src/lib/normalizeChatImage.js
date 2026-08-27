const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

function fileName(file) {
  return String(file?.name || "image");
}

function mimeType(file) {
  return String(file?.type || "").toLowerCase();
}

function isJpeg(file) {
  const type = mimeType(file);
  return type === "image/jpeg" || type === "image/jpg" || /\.jpe?g$/i.test(fileName(file));
}

function isPng(file) {
  return mimeType(file) === "image/png" || /\.png$/i.test(fileName(file));
}

function isWebp(file) {
  return mimeType(file) === "image/webp" || /\.webp$/i.test(fileName(file));
}

function isHeic(file) {
  const type = mimeType(file);
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    /\.(heic|heif)$/i.test(fileName(file))
  );
}

function loadHtmlImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this photo. Try JPG, PNG, or WebP."));
    };
    image.src = url;
  });
}

async function decodeImage(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // Some browsers cannot decode HEIC via createImageBitmap.
    }
  }

  return loadHtmlImage(file);
}

function canvasToJpeg(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not convert this photo. Try JPG, PNG, or WebP."));
      },
      "image/jpeg",
      quality,
    );
  });
}

async function convertToJpegFile(file) {
  const image = await decodeImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not convert this photo. Try JPG, PNG, or WebP.");
  }
  context.drawImage(image, 0, 0);
  if (typeof image.close === "function") image.close();

  let quality = 0.86;
  let blob = await canvasToJpeg(canvas, quality);
  while (blob.size > MAX_IMAGE_BYTES && quality > 0.5) {
    quality -= 0.12;
    blob = await canvasToJpeg(canvas, quality);
  }

  const base = fileName(file).replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}

export async function normalizeChatImage(file) {
  if (!file) return null;

  const type = mimeType(file);
  const looksLikeImage =
    type.startsWith("image/") || /\.(jpe?g|png|webp|heic|heif)$/i.test(fileName(file));

  if (!looksLikeImage) {
    throw new Error("Image must be JPG, PNG, WebP, or HEIC");
  }

  if (isHeic(file) || (!isJpeg(file) && !isPng(file) && !isWebp(file))) {
    const jpeg = await convertToJpegFile(file);
    if (jpeg.size > MAX_IMAGE_BYTES) {
      throw new Error("Image must be 2MB or smaller");
    }
    return jpeg;
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 2MB or smaller");
  }

  return file;
}
