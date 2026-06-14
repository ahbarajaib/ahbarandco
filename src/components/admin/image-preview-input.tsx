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
};

export function ImagePreviewInput({
  id,
  name,
  label,
  defaultValue,
  aspectRatio = "video",
  preferredDimensions,
}: ImagePreviewInputProps) {
  const [url, setUrl] = useState(defaultValue);
  const [filePreview, setFilePreview] = useState<string>("");

  const preferredSizeDesc = preferredDimensions || (
    aspectRatio === "portrait" ? "4:5 (e.g. 1200 × 1500 px)" :
    aspectRatio === "square" ? "1:1 (e.g. 1600 × 1600 px)" :
    aspectRatio === "video" ? "3:2 or 16:9 (e.g. 1600 × 1066 px or 2400 × 1350 px)" :
    aspectRatio === "wide" ? "21:9 (e.g. 2560 × 1100 px)" :
    undefined
  );

  useEffect(() => {
    // Cleanup temporary object URLs on unmount
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
      const preview = URL.createObjectURL(file);
      setFilePreview(preview);
    } else {
      setFilePreview("");
    }
  };

  const aspectClasses = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[4/5]",
    wide: "aspect-[21/9]",
  };

  const activePreviewUrl = filePreview || url;

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
      
      {/* Hidden input to pass existing image URL back to Server Action */}
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
            name={`${name}_file`}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => document.getElementById(`${id}-file`)?.click()}
            className="flex flex-col items-center justify-center border border-dashed border-border/80 hover:border-wood-medium/60 rounded-sm bg-white p-6 w-full transition cursor-pointer text-center group shadow-2xs hover:shadow-xs"
          >
            <div className="rounded-full bg-stone-50 p-2.5 text-text-secondary/70 group-hover:bg-wood-medium/10 group-hover:text-wood-medium transition duration-200">
              <UploadCloud className="size-5 stroke-[1.5]" />
            </div>
            <span className="mt-2 text-xs font-semibold text-wood-dark group-hover:text-wood-medium transition">
              Select image file
            </span>
            <span className="mt-1 text-[10px] text-text-secondary/60">
              PNG, JPG, or WEBP up to 20MB
            </span>
          </button>
        </div>
      </div>

      {activePreviewUrl && (activePreviewUrl.startsWith("http") || activePreviewUrl.startsWith("blob:") || activePreviewUrl.startsWith("/")) ? (
        <div className="mt-3.5 space-y-2">
          <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block">Live Preview</span>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3.5">
            <div className={`relative overflow-hidden rounded-sm border border-border bg-background-secondary w-full max-w-sm ${aspectClasses[aspectRatio]}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePreviewUrl}
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
                setFilePreview("");
                const fileInput = document.getElementById(`${id}-file`) as HTMLInputElement | null;
                if (fileInput) fileInput.value = "";
              }}
              className="h-10 px-4 border border-red-200 bg-red-50/50 hover:bg-red-50 hover:border-red-300 text-red-700 text-[10px] font-semibold uppercase tracking-wider rounded-sm transition cursor-pointer flex items-center justify-center gap-1.5 inline-flex"
            >
              <Trash2 className="size-3.5 stroke-[1.8]" />
              Remove
            </button>
          </div>
          {filePreview && (
            <span className="inline-block text-[10px] text-wood-medium font-medium bg-wood-medium/10 px-2 py-0.5 rounded-sm mt-1">
              Staged for upload (local file)
            </span>
          )}
        </div>
      ) : (
        <div className="mt-2 text-xs text-text-secondary italic">No preview available</div>
      )}
    </div>
  );
}
