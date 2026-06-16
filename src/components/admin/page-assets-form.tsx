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
      <div className="border-b border-border pb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-medium text-wood-dark">{title}</h2>
          <p className="text-sm text-text-secondary mt-1">{description}</p>
        </div>
        {isPending && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-wood-medium animate-pulse flex items-center gap-2 bg-stone-50 border border-stone-200/60 px-3 py-1.5 rounded-sm">
            <span className="size-1.5 bg-wood-medium rounded-full animate-ping"></span>
            Saving...
          </span>
        )}
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
            autoSubmitForm={true}
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
      </form>
    </div>
  );
}
