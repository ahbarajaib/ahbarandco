"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { UploadCloud, Trash2 } from "lucide-react";

type ImagePreviewInputProps = {
  id: string;
  name: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
  aspectRatio?: "video" | "square" | "portrait" | "wide";
  preferredDimensions?: string;
  folder?: string;
};

export function ImagePreviewInput({
  id,
  name,
  label,
  defaultValue,
  aspectRatio = "video",
  preferredDimensions,
  folder = "uploads",
}: ImagePreviewInputProps) {
  const [url, setUrl] = useState(defaultValue);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with default value if it changes
  useEffect(() => {
    setUrl(defaultValue);
  }, [defaultValue]);

  const preferredSizeDesc = preferredDimensions || (
    aspectRatio === "portrait" ? "4:5 (e.g. 1200 × 1500 px)" :
    aspectRatio === "square" ? "1:1 (e.g. 1600 × 1600 px)" :
    aspectRatio === "video" ? "3:2 (e.g. 1600 × 1066 px)" :
    aspectRatio === "wide" ? "21:9 (e.g. 2560 × 1100 px)" :
    undefined
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const maxSize = 15 * 1024 * 1024; // 15MB limit
    if (file.size > maxSize) {
      setError(`File "${file.name}" is too large. Maximum size is 15MB.`);
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUrl(data.url);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
      e.target.value = ""; // Clear file input selection
    }
  };

  const aspectClasses = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[4/5]",
    wide: "aspect-[21/9]",
  };

  return (
    <div className="space-y-3.5 p-4 bg-stone-50 border border-border/60 rounded-sm sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/20 pb-2 mb-1">
        <Label htmlFor={id} className="text-[10px] font-semibold uppercase tracking-wider text-wood-dark block">{label}</Label>
        {preferredSizeDesc && (
          <span className="text-[9px] font-medium text-text-secondary/70 bg-stone-100 px-2 py-0.5 rounded-sm border border-stone-200/40">
            Pref. size: {preferredSizeDesc}
          </span>
        )}
      </div>
      
      {/* Hidden input to pass the uploaded image URL back in standard form actions */}
      <input
        type="hidden"
        id={id}
        name={name}
        value={url}
      />
      
      <div className="space-y-1.5">
        <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block">Upload Image File</span>
        <div className="relative">
          <input
            id={`${id}-file`}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => document.getElementById(`${id}-file`)?.click()}
            className="flex flex-col items-center justify-center border border-dashed border-border/80 hover:border-wood-medium/60 rounded-sm bg-white p-6 w-full transition cursor-pointer text-center group shadow-2xs hover:shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center">
                <div className="size-6 animate-spin rounded-full border-2 border-wood-medium border-t-transparent mb-2"></div>
                <span className="text-xs font-semibold text-wood-medium">
                  Uploading image...
                </span>
              </div>
            ) : (
              <>
                <div className="rounded-full bg-stone-50 p-2.5 text-text-secondary/70 group-hover:bg-wood-medium/10 group-hover:text-wood-medium transition duration-200">
                  <UploadCloud className="size-5 stroke-[1.5]" />
                </div>
                <span className="mt-2 text-xs font-semibold text-wood-dark group-hover:text-wood-medium transition">
                  Select image file
                </span>
                <span className="mt-1 text-[10px] text-text-secondary/60">
                  PNG, JPG, or WEBP up to 15MB
                </span>
              </>
            )}
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-600 font-medium mt-1.5" role="alert">
            {error}
          </p>
        )}
      </div>

      {url ? (
        <div className="mt-3.5 space-y-2">
          <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block">Live Preview</span>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3.5">
            <div className={`relative overflow-hidden rounded-sm border border-border bg-background-secondary w-full max-w-sm ${aspectClasses[aspectRatio]}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${label} preview`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
                onLoad={(e) => {
                  (e.target as HTMLElement).style.display = "block";
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setUrl("");
              }}
              className="h-10 px-4 border border-red-200 bg-red-50/50 hover:bg-red-50 hover:border-red-300 text-red-700 text-[10px] font-semibold uppercase tracking-wider rounded-sm transition cursor-pointer flex items-center justify-center gap-1.5 inline-flex"
            >
              <Trash2 className="size-3.5 stroke-[1.8]" />
              Remove
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
