"use client";

import React, { useActionState, startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionResponse } from "@/lib/admin-actions";

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
  const initialImagesText = initialData
    ? initialData.images.map((img) => img.url).join("\n")
    : "";

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
    <div className="space-y-6 max-w-2xl bg-white border border-border p-6 sm:p-8 rounded-sm shadow-sm">
      <div className="border-b border-border pb-4">
        <h2 className="font-heading text-2xl font-medium text-wood-dark">{title}</h2>
      </div>

      <form action={formAction} className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
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
            <Label htmlFor="shortDesc">Short Description</Label>
            <Input
              id="shortDesc"
              name="shortDesc"
              defaultValue={initialData?.shortDesc || ""}
              disabled={isPending}
              placeholder="e.g. Sculptural lounge chair in solid wood frame."
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Long/Detailed Description</Label>
            <textarea
              id="description"
              name="description"
              defaultValue={initialData?.description || ""}
              disabled={isPending}
              rows={4}
              placeholder="Write detailed specifications, narrative, and craftsman details..."
              className="flex w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* Pricing, Stock, and Collection */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="price">Price (INR) *</Label>
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
            <Label htmlFor="stock">Inventory / Stock *</Label>
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
            <Label htmlFor="collectionId">Collection</Label>
            <select
              id="collectionId"
              name="collectionId"
              defaultValue={initialData?.collectionId || ""}
              disabled={isPending}
              className="flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
            <Label htmlFor="material">Material</Label>
            <Input
              id="material"
              name="material"
              defaultValue={initialData?.material || ""}
              disabled={isPending}
              placeholder="e.g. Solid Oak, Natural Linen"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dimensions">Dimensions</Label>
            <Input
              id="dimensions"
              name="dimensions"
              defaultValue={initialData?.dimensions || ""}
              disabled={isPending}
              placeholder='e.g. 30" W × 33" D × 31" H'
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="careGuide">Care Guide</Label>
            <Input
              id="careGuide"
              name="careGuide"
              defaultValue={initialData?.careGuide || ""}
              disabled={isPending}
              placeholder="e.g. Dust with soft dry cloth..."
            />
          </div>
        </div>

        {/* Product Images List */}
        <div className="space-y-2">
          <Label htmlFor="images">Product Images (one URL per line)</Label>
          <textarea
            id="images"
            name="images"
            defaultValue={initialImagesText}
            disabled={isPending}
            rows={4}
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            className="flex w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono text-xs"
          />
          <p className="text-[10px] text-text-secondary">
            Provide public URLs for lifestyle or product angles. Seed uses Unsplash URLs.
          </p>
        </div>

        {/* Toggles (Published & Featured) */}
        <div className="flex flex-wrap gap-6 pt-2">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              name="published"
              value="true"
              defaultChecked={initialData?.published ?? true}
              disabled={isPending}
              className="h-4 w-4 rounded-sm border-border text-wood-medium focus:ring-wood-medium"
            />
            <span>Published (make visible to catalog)</span>
          </label>
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              value="true"
              defaultChecked={initialData?.featured ?? false}
              disabled={isPending}
              className="h-4 w-4 rounded-sm border-border text-wood-medium focus:ring-wood-medium"
            />
            <span>Featured (displays on home page)</span>
          </label>
        </div>

        {state.error && (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            className="border-border hover:bg-background-secondary"
            render={<Link href="/admin/products" />}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-wood-dark text-background-primary hover:bg-wood-medium"
          >
            {isPending ? "Saving changes..." : "Save Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
