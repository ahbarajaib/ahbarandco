"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionResponse } from "@/lib/admin-actions";

type JournalFormProps = {
  initialData?: {
    id?: string;
    title: string;
    excerpt: string | null;
    content: string;
    coverImageUrl: string | null;
    published: boolean;
  };
  submitAction: (formData: FormData) => Promise<ActionResponse>;
  title: string;
};

export function JournalForm({ initialData, submitAction, title }: JournalFormProps) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState<ActionResponse, FormData>(
    async (prevState, formData) => {
      const result = await submitAction(formData);
      if (result.success) {
        router.push("/admin/journal");
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
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Article Title *</Label>
          <Input
            id="title"
            name="title"
            defaultValue={initialData?.title || ""}
            required
            disabled={isPending}
            placeholder="e.g. The Art of Joinery: Why Details Matter"
          />
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt / Summary</Label>
          <Input
            id="excerpt"
            name="excerpt"
            defaultValue={initialData?.excerpt || ""}
            disabled={isPending}
            placeholder="A short one-sentence hook that appears in listings..."
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Body Content *</Label>
          <textarea
            id="content"
            name="content"
            defaultValue={initialData?.content || ""}
            required
            disabled={isPending}
            rows={10}
            placeholder="Write article content. Supports text or HTML format..."
            className="flex w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-serif leading-relaxed"
          />
        </div>

        {/* Cover Image URL */}
        <div className="space-y-2">
          <Label htmlFor="coverImageUrl">Cover Image URL</Label>
          <Input
            id="coverImageUrl"
            name="coverImageUrl"
            defaultValue={initialData?.coverImageUrl || ""}
            disabled={isPending}
            placeholder="e.g. https://images.unsplash.com/..."
          />
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
            <span>Published (make visible in the Journal list)</span>
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
            render={<Link href="/admin/journal" />}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-wood-dark text-background-primary hover:bg-wood-medium"
          >
            {isPending ? "Saving article..." : "Save Article"}
          </Button>
        </div>
      </form>
    </div>
  );
}
