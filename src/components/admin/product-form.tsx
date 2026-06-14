"use client";

import React, { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionResponse } from "@/lib/admin-actions";
import { UploadCloud, Trash2 } from "lucide-react";

type ProductImageProps = {
  url: string;
};

type ProductFormProps = {
  initialData?: {
    id?: string;
    name: string;
    shortDesc: string | null;
    description: string | null;
    price: number;
    compareAtPrice: number | null;
    stock: number;
    material: string | null;
    dimensions: string | null;
    careGuide: string | null;
    featured: boolean;
    published: boolean;
    collectionId: string | null;
    images: ProductImageProps[];
  };
  collections: { id: string; name: string }[];
  submitAction: (formData: FormData) => Promise<ActionResponse>;
  title: string;
};

export function ProductForm({ initialData, collections, submitAction, title }: ProductFormProps) {
  const router = useRouter();

  // Price conversion (initialData.price is in paise, so divide by 100 for user display)
  const displayPrice = initialData ? (initialData.price / 100).toString() : "";
  const displayCompareAtPrice = initialData?.compareAtPrice 
    ? (initialData.compareAtPrice / 100).toString() 
    : "";
  const [existingImages, setExistingImages] = useState<string[]>(
    initialData ? initialData.images.map((img) => img.url) : []
  );
  const [uploadingFiles, setUploadingFiles] = useState<{ id: string; name: string }[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setFileError(null);
    const maxSize = 15 * 1024 * 1024; // 15MB limit

    // Process files in parallel
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxSize) {
        setFileError(`File "${file.name}" is too large. Maximum size is 15MB.`);
        continue;
      }

      // Generate a temporary unique ID for tracking progress
      const tempId = Math.random().toString(36).substring(7);
      
      // Add to uploading list
      setUploadingFiles((prev) => [...prev, { id: tempId, name: file.name }]);

      // Start uploading immediately
      (async () => {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("folder", "products");

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "Upload failed");
          }

          // Add newly uploaded URL to existing list
          setExistingImages((prev) => [...prev, data.url]);
        } catch (err: any) {
          console.error("Product image upload error:", err);
          setFileError(`Failed to upload "${file.name}": ${err.message || "Unknown error"}`);
        } finally {
          // Remove from uploading list
          setUploadingFiles((prev) => prev.filter((f) => f.id !== tempId));
        }
      })();
    }

    e.target.value = ""; // Clear file selector
  };



  const handleRemoveExisting = (indexToRemove: number) => {
    setExistingImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const [state, formAction, isPending] = useActionState<ActionResponse, FormData>(
    async (prevState, formData) => {
      const result = await submitAction(formData);
      if (result.success) {
        router.push("/admin/products");
        router.refresh();
      }
      return result;
    },
    {}
  );

  return (
    <div className="space-y-6 max-w-2xl bg-white border border-border p-6 sm:p-8 rounded-sm shadow-xs">
      <div className="border-b border-border pb-4">
        <h2 className="font-heading text-2xl font-medium text-wood-dark">{title}</h2>
      </div>

      <form action={formAction} className="space-y-6" encType="multipart/form-data">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5 block">Product Name *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={initialData?.name || ""}
            required
            disabled={isPending}
            placeholder="e.g. Oak Lounge Chair"
          />
        </div>

        {/* Short & Long Description */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="shortDesc" className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5 block">Short Description</Label>
            <Input
              id="shortDesc"
              name="shortDesc"
              defaultValue={initialData?.shortDesc || ""}
              disabled={isPending}
              placeholder="e.g. Sculptural lounge chair in solid wood frame."
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description" className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5 block">Long/Detailed Description</Label>
            <textarea
              id="description"
              name="description"
              defaultValue={initialData?.description || ""}
              disabled={isPending}
              rows={4}
              placeholder="Write detailed specifications, narrative, and craftsman details..."
              className="flex w-full rounded-sm border border-border bg-white px-3.5 py-2.5 text-sm shadow-xs transition-all placeholder:text-text-secondary/40 outline-none hover:border-wood-medium/20 focus-visible:border-wood-medium focus-visible:ring-2 focus-visible:ring-wood-medium/10 disabled:cursor-not-allowed disabled:bg-background-secondary/50 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Pricing, Stock, and Collection */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="price" className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5 block">Price (INR) *</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              defaultValue={displayPrice}
              required
              disabled={isPending}
              placeholder="e.g. 24999.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="compareAtPrice" className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5 block">Compare At Price (INR)</Label>
            <Input
              id="compareAtPrice"
              name="compareAtPrice"
              type="number"
              step="0.01"
              defaultValue={displayCompareAtPrice}
              disabled={isPending}
              placeholder="e.g. 29999.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock" className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5 block">Inventory / Stock *</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              defaultValue={initialData?.stock ?? 0}
              required
              disabled={isPending}
              placeholder="e.g. 10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="collectionId" className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5 block">Collection</Label>
            <select
              id="collectionId"
              name="collectionId"
              defaultValue={initialData?.collectionId || ""}
              disabled={isPending}
              className="flex h-10 w-full rounded-sm border border-border bg-white px-3.5 py-2 text-sm shadow-xs transition-all focus-visible:border-wood-medium focus-visible:ring-2 focus-visible:ring-wood-medium/10 outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select collection...</option>
              {collections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Details: Material, Dimensions, Care */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="material" className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5 block">Material</Label>
            <Input
              id="material"
              name="material"
              defaultValue={initialData?.material || ""}
              disabled={isPending}
              placeholder="e.g. Solid Oak, Natural Linen"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dimensions" className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5 block">Dimensions</Label>
            <Input
              id="dimensions"
              name="dimensions"
              defaultValue={initialData?.dimensions || ""}
              disabled={isPending}
              placeholder='e.g. 30" W × 33" D × 31" H'
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="careGuide" className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5 block">Care Guide</Label>
            <Input
              id="careGuide"
              name="careGuide"
              defaultValue={initialData?.careGuide || ""}
              disabled={isPending}
              placeholder="e.g. Dust with soft dry cloth..."
            />
          </div>
        </div>

        {/* Product Images Uploader */}
        <div className="space-y-4 p-4 bg-background-primary/30 border border-border/50 rounded-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/20 pb-1.5 mb-1">
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-wood-dark block">Product Images</Label>
            <span className="text-[9px] font-medium text-text-secondary/70 bg-stone-100/80 px-2 py-0.5 rounded-sm border border-stone-200/40">
              Pref. size: 1:1 or 4:5 (Min 1600px width)
            </span>
          </div>
                   {/* Grid of existing/added images and uploading placeholders */}
          {(existingImages.length > 0 || uploadingFiles.length > 0) && (
            <div className="space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block">Images</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Existing Images */}
                {existingImages.map((url, idx) => (
                  <div key={url} className="relative aspect-square group border border-border bg-white rounded-sm overflow-hidden shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Product image ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <input type="hidden" name="existingImages" value={url} />
                    <button
                      type="button"
                      onClick={() => handleRemoveExisting(idx)}
                      className="absolute top-1.5 right-1.5 size-7 rounded-sm bg-red-600/90 text-white flex items-center justify-center hover:bg-red-700 transition opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer shadow-sm"
                      title="Remove image"
                    >
                      <Trash2 className="size-4 stroke-[1.8]" />
                    </button>
                    <span className="absolute bottom-1 left-1 right-1 text-[8px] font-semibold uppercase tracking-wider bg-wood-dark/80 text-white text-center py-0.5 rounded-xs">
                      {url.startsWith("/uploads/") ? "Local" : "External"}
                    </span>
                  </div>
                ))}

                {/* Uploading Placeholders */}
                {uploadingFiles.map((file) => (
                  <div key={file.id} className="relative aspect-square border border-dashed border-wood-medium/40 bg-wood-medium/5 rounded-sm overflow-hidden flex flex-col items-center justify-center p-3 text-center">
                    <div className="size-5 animate-spin rounded-full border-2 border-wood-medium border-t-transparent mb-2"></div>
                    <span className="text-[9px] font-semibold text-wood-medium uppercase tracking-wider">
                      Uploading
                    </span>
                    <span className="text-[8px] text-text-secondary truncate w-full mt-1">
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-border/40 space-y-2">
            {/* File Upload Selector */}
            <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block">Upload New Images</span>
            <div className="relative">
              <input
                id="product-image-files"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                disabled={isPending}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => document.getElementById("product-image-files")?.click()}
                disabled={isPending}
                className={`flex flex-col items-center justify-center border border-dashed border-border/80 hover:border-wood-medium/60 rounded-sm bg-white p-6 w-full transition cursor-pointer text-center group shadow-2xs hover:shadow-xs ${
                  isPending ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <div className="rounded-full bg-stone-50 p-2.5 text-text-secondary/70 group-hover:bg-wood-medium/10 group-hover:text-wood-medium transition duration-200">
                  <UploadCloud className="size-5 stroke-[1.5]" />
                </div>
                <span className="mt-2 text-xs font-semibold text-wood-dark group-hover:text-wood-medium transition">
                  Select product images
                </span>
                <span className="mt-1 text-[10px] text-text-secondary/60">
                  You can select multiple files. PNG, JPG, or WEBP up to 15MB each.
                </span>
              </button>
            </div>
            {fileError && (
              <p className="text-xs text-red-600 font-medium mt-1.5" role="alert">
                {fileError}
              </p>
            )}
          </div>
        </div>

        {/* Toggles (Published & Featured) */}
        <div className="flex flex-wrap gap-6 pt-2">
          <label className="flex items-center gap-2.5 text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              name="published"
              value="true"
              defaultChecked={initialData?.published ?? true}
              disabled={isPending}
              className="size-4 rounded-xs border-border text-wood-medium focus:ring-wood-medium/20 focus:ring-offset-0 cursor-pointer accent-wood-medium"
            />
            <span>Published (make visible to catalog)</span>
          </label>
          <label className="flex items-center gap-2.5 text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              name="featured"
              value="true"
              defaultChecked={initialData?.featured ?? false}
              disabled={isPending}
              className="size-4 rounded-xs border-border text-wood-medium focus:ring-wood-medium/20 focus:ring-offset-0 cursor-pointer accent-wood-medium"
            />
            <span>Featured (displays on home page)</span>
          </label>
        </div>

        {state.error && (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            className="h-10 px-5 border-border hover:bg-background-secondary text-text-primary transition-all duration-200 rounded-sm text-[10px] uppercase tracking-widest font-semibold cursor-pointer"
            render={<Link href="/admin/products" />}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="h-10 px-5 bg-wood-dark text-background-primary hover:bg-wood-medium transition-all duration-200 rounded-sm text-[10px] uppercase tracking-widest font-semibold cursor-pointer"
          >
            {isPending ? "Saving changes..." : "Save Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
