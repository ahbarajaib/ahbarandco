"use client";

import React from "react";

type DeleteFormProps = {
  id: string;
  action: (id: string) => Promise<{ error?: string; success?: boolean }>;
  label?: string;
  confirmMessage?: string;
};

export function DeleteForm({
  id,
  action,
  label = "Delete",
  confirmMessage = "Are you sure you want to delete this item? This action cannot be undone.",
}: DeleteFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    if (!window.confirm(confirmMessage)) {
      e.preventDefault();
    }
  };

  return (
    <form
      action={async () => {
        const res = await action(id);
        if (res?.error) {
          alert(res.error);
        }
      }}
      onSubmit={handleSubmit}
      className="inline-block"
    >
      <button
        type="submit"
        className="text-xs font-medium text-destructive hover:underline cursor-pointer"
      >
        {label}
      </button>
    </form>
  );
}
