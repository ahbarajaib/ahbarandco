"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ImagePreviewInputProps = {
  id: string;
  name: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
  aspectRatio?: "video" | "square" | "portrait" | "wide";
};

export function ImagePreviewInput({
  id,
  name,
  label,
  defaultValue,
  placeholder,
  aspectRatio = "video",
}: ImagePreviewInputProps) {
  const [url, setUrl] = useState(defaultValue);
  const [filePreview, setFilePreview] = useState<string>("");

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

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    // If user changes text URL, clear file upload input so text URL is preferred
    setFilePreview("");
    const fileInput = document.getElementById(`${id}-file`) as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = "";
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
    <div className="space-y-3 p-4 bg-background-primary/30 border border-border/50 rounded-sm">
      <Label htmlFor={id} className="text-[10px] font-semibold uppercase tracking-wider text-wood-dark block mb-1.5">{label}</Label>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* URL option */}
        <div className="space-y-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block">Option 1: Image URL</span>
          <Input
            id={id}
            name={name}
            value={url}
            onChange={handleUrlChange}
            placeholder={placeholder || "https://images.unsplash.com/..."}
            className="bg-white"
          />
        </div>

        {/* File upload option */}
        <div className="space-y-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block">Option 2: Upload File</span>
          <div className="relative">
            <input
              id={`${id}-file`}
              name={`${name}_file`}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="flex h-10 w-full rounded-sm border border-border bg-white px-3.5 py-2 text-xs shadow-xs file:border-0 file:bg-transparent file:text-xs file:font-medium text-text-secondary file:text-wood-dark hover:file:underline cursor-pointer focus-visible:outline-none focus-visible:border-wood-medium disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {activePreviewUrl && (activePreviewUrl.startsWith("http") || activePreviewUrl.startsWith("blob:")) ? (
        <div className="mt-3 space-y-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block">Live Preview</span>
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
          {filePreview && (
            <span className="inline-block text-[10px] text-wood-medium font-medium bg-wood-medium/10 px-2 py-0.5 rounded-sm">
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
