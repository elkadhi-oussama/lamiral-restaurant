"use client";

import { useRef, useState } from "react";

async function resizeImage(file: File, maxSize: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas not available");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No image"))),
      "image/jpeg",
      0.82,
    );
  });
}

export default function ImageField({
  name,
  label,
  buttonText,
  errorText,
  maxSize,
  currentUrl,
  round = false,
}: {
  name: string;
  label: string;
  buttonText: string;
  errorText: string;
  maxSize: number;
  currentUrl?: string | null;
  round?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const shown = preview ?? currentUrl ?? null;
  const shape = round ? "rounded-full" : "rounded-xl";

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);

    try {
      const blob = await resizeImage(file, maxSize);
      const resized = new File([blob], "photo.jpg", { type: "image/jpeg" });
      const transfer = new DataTransfer();
      transfer.items.add(resized);
      if (inputRef.current) inputRef.current.files = transfer.files;
      setPreview(URL.createObjectURL(blob));
    } catch {
      setError(errorText);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <p className="text-sm">{label}</p>
      <div className="mt-2 flex items-center gap-4">
        {shown ? (
          <img
            src={shown}
            alt=""
            className={`h-20 w-20 object-cover ${shape}`}
          />
        ) : (
          <div
            className={`flex h-20 w-20 items-center justify-center bg-brand-brown text-3xl ${shape}`}
          >
            📷
          </div>
        )}
        <label className="cursor-pointer rounded-full border border-brand-yellow px-4 py-2 text-sm font-semibold text-brand-yellow hover:bg-brand-yellow/10">
          {buttonText}
          <input
            ref={inputRef}
            type="file"
            name={name}
            accept="image/*"
            onChange={handleChange}
            className="sr-only"
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}