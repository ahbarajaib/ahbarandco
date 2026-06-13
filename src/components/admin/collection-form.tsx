"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionResponse } from "@/lib/admin-actions";
import { ImagePreviewInput } from "@/components/admin/image-preview-input";

type CollectionFormProps = {
  initialData?: {
    id?: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    sortOrder: number;
    published: boolean;
  };
  submitAction: (formData: FormData) => Promise<ActionResponse>;
  title: string;
};

export function CollectionForm({ initialData, submitAction, title }: CollectionFormProps) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState<ActionResponse, FormData>(
    async (prevState, formData) => {
      const result = await submitAction(formData);
      if (result.success) {
        router.push("/admin/collections");
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
          <Label htmlFor="name" className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5 block">Collection Name *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={initialData?.name || ""}
            required
            disabled={isPending}
            placeholder="e.g. Lounge Chairs"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5 block">Description</Label>
          <textarea
            id="description"
            name="description"
            defaultValue={initialData?.description || ""}
            disabled={isPending}
            rows={3}
            placeholder="Short description highlighting the collection theme and materials..."
            className="flex w-full rounded-sm border border-border bg-white px-3.5 py-2.5 text-sm shadow-xs transition-all placeholder:text-text-secondary/40 outline-none hover:border-wood-medium/20 focus-visible:border-wood-medium focus-visible:ring-2 focus-visible:ring-wood-medium/10 disabled:cursor-not-allowed disabled:bg-background-secondary/50 disabled:opacity-50"
          />
        </div>

        {/* Cover Image & Sort Order */}
        <div className="space-y-5">
          <ImagePreviewInput
            id="imageUrl"
            name="imageUrl"
            label="Collection Cover Image"
            defaultValue={initialData?.imageUrl || ""}
            aspectRatio="portrait"
          />

          <div className="space-y-2 max-w-xs">
            <Label htmlFor="sortOrder" className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5 block">Sort Order</Label>
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              defaultValue={initialData?.sortOrder ?? 0}
              required
              disabled={isPending}
              placeholder="e.g. 1"
            />
          </div>
        </div>

        {/* Published Toggle */}
        <div className="pt-1">
          <label className="flex items-center gap-2.5 text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              name="published"
              value="true"
              defaultChecked={initialData?.published ?? true}
              disabled={isPending}
              className="size-4 rounded-xs border-border text-wood-medium focus:ring-wood-medium/20 focus:ring-offset-0 cursor-pointer accent-wood-medium"
            />
            <span>Published (make collection pages active)</span>
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
            render={<Link href="/admin/collections" />}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="h-10 px-5 bg-wood-dark text-background-primary hover:bg-wood-medium transition-all duration-200 rounded-sm text-[10px] uppercase tracking-widest font-semibold cursor-pointer"
          >
            {isPending ? "Saving changes..." : "Save Collection"}
          </Button>
        </div>
      </form>
    </div>
  );
}
