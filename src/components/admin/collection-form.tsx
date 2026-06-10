"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionResponse } from "@/lib/admin-actions";

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
    <div className="space-y-6 max-w-2xl bg-white border border-border p-6 sm:p-8 rounded-sm shadow-sm">
      <div className="border-b border-border pb-4">
        <h2 className="font-heading text-2xl font-medium text-wood-dark">{title}</h2>
      </div>

      <form action={formAction} className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Collection Name *</Label>
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
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            defaultValue={initialData?.description || ""}
            disabled={isPending}
            rows={3}
            placeholder="Short description highlighting the collection theme and materials..."
            className="flex w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Cover Image URL & Sort Order */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="imageUrl">Cover Image URL</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              defaultValue={initialData?.imageUrl || ""}
              disabled={isPending}
              placeholder="e.g. https://images.unsplash.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
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
        <div className="pt-2">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              name="published"
              value="true"
              defaultChecked={initialData?.published ?? true}
              disabled={isPending}
              className="h-4 w-4 rounded-sm border-border text-wood-medium focus:ring-wood-medium"
            />
            <span>Published (make collection pages active)</span>
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
            render={<Link href="/admin/collections" />}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-wood-dark text-background-primary hover:bg-wood-medium"
          >
            {isPending ? "Saving changes..." : "Save Collection"}
          </Button>
        </div>
      </form>
    </div>
  );
}
