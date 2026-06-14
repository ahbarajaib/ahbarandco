"use client";

import React, { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { ActionResponse } from "@/lib/admin-actions";
import { ImagePreviewInput } from "@/components/admin/image-preview-input";

type PageAssetsFormProps = {
  page: string;
  title: string;
  description: string;
  slots: {
    name: string;
    label: string;
    defaultValue: string;
    aspectRatio?: "video" | "square" | "portrait" | "wide";
  }[];
  submitAction: (formData: FormData) => Promise<ActionResponse>;
};

export function PageAssetsForm({
  page,
  title,
  description,
  slots,
  submitAction,
}: PageAssetsFormProps) {
  const [state, formAction, isPending] = useActionState<ActionResponse, FormData>(
    async (prevState, formData) => {
      return submitAction(formData);
    },
    {}
  );

  return (
    <div className="space-y-6 bg-white border border-border p-6 sm:p-8 rounded-sm shadow-sm">
      <div className="border-b border-border pb-4">
        <h2 className="font-heading text-2xl font-medium text-wood-dark">{title}</h2>
        <p className="text-sm text-text-secondary mt-1">{description}</p>
      </div>

      <form action={formAction} className="space-y-6">
        {slots.map((slot) => (
          <ImagePreviewInput
            key={slot.name}
            id={`${page}-${slot.name}`}
            name={slot.name}
            label={slot.label}
            defaultValue={slot.defaultValue}
            aspectRatio={slot.aspectRatio}
            folder="pages"
          />
        ))}

        {state.error && (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        )}

        {state.success && (
          <p className="text-sm text-wood-medium font-medium" role="status">
            Images updated successfully!
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="submit"
            disabled={isPending}
            className="h-10 px-5 bg-wood-dark text-background-primary hover:bg-wood-medium transition-all duration-200 rounded-sm text-[10px] uppercase tracking-widest font-semibold cursor-pointer"
          >
            {isPending ? "Saving changes..." : "Save Images"}
          </Button>
        </div>
      </form>
    </div>
  );
}
