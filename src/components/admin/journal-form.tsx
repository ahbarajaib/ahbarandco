"use client";

import React, { useActionState, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionResponse } from "@/lib/admin-actions";
import { parseMarkdown } from "@/lib/markdown";
import { ImagePreviewInput } from "@/components/admin/image-preview-input";
import { 
  Bold, 
  Italic, 
  Heading2, 
  Link as LinkIcon, 
  Quote, 
  List as ListIcon, 
  Image as ImageIcon,
  Eye,
  PenTool
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [content, setContent] = useState(initialData?.content || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [state, formAction, isPending] = useActionState<ActionResponse, FormData>(
    async (prevState, formData) => {
      // Ensure the content state is appended correctly (in case it wasn't captured)
      formData.set("content", content);
      
      const result = await submitAction(formData);
      if (result.success) {
        router.push("/admin/journal");
        router.refresh();
      }
      return result;
    },
    {}
  );

  const insertMarkdown = (syntax: string, placeholder = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let replacement = "";
    let cursorOffset = 0;

    switch (syntax) {
      case "bold":
        replacement = `**${selectedText || placeholder || "bold text"}**`;
        cursorOffset = selectedText ? replacement.length : replacement.length - 2;
        break;
      case "italic":
        replacement = `*${selectedText || placeholder || "italic text"}*`;
        cursorOffset = selectedText ? replacement.length : replacement.length - 1;
        break;
      case "heading":
        replacement = `\n## ${selectedText || placeholder || "Heading 2"}\n`;
        cursorOffset = replacement.length;
        break;
      case "link":
        replacement = `[${selectedText || placeholder || "link text"}](https://example.com)`;
        cursorOffset = selectedText ? replacement.length : replacement.length - 21; // Position cursor inside URL parentheses
        break;
      case "blockquote":
        replacement = `\n> ${selectedText || placeholder || "Blockquote"}\n`;
        cursorOffset = replacement.length;
        break;
      case "list":
        replacement = `\n- ${selectedText || placeholder || "List item"}\n`;
        cursorOffset = replacement.length;
        break;
      case "image":
        replacement = `![${selectedText || placeholder || "Image description"}](https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80)`;
        cursorOffset = selectedText ? replacement.length : replacement.length - 75; // Position cursor inside URL parentheses
        break;
      default:
        return;
    }

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    setContent(newValue);
    
    // Defer focusing & updating cursor offset
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 0);
  };

  return (
    <div className="space-y-6 max-w-3xl bg-white border border-border p-6 sm:p-8 rounded-sm shadow-sm">
      <div className="border-b border-border pb-4">
        <h2 className="font-heading text-2xl font-medium text-wood-dark">{title}</h2>
      </div>

      <form action={formAction} className="space-y-6" encType="multipart/form-data">
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

        {/* Content Wrapper */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
            <Label htmlFor="content" className="pt-1">Body Content *</Label>
            
            {/* Tabs & Toolbar */}
            <div className="flex items-center gap-4">
              <div className="flex bg-background-secondary/20 p-0.5 rounded-sm border border-border/10">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-sm transition-all ${
                    activeTab === "write" 
                      ? "bg-white text-wood-dark shadow-sm border border-border/15" 
                      : "text-text-secondary hover:text-wood-dark"
                  }`}
                >
                  <PenTool className="h-3 w-3" />
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-sm transition-all ${
                    activeTab === "preview" 
                      ? "bg-white text-wood-dark shadow-sm border border-border/15" 
                      : "text-text-secondary hover:text-wood-dark"
                  }`}
                >
                  <Eye className="h-3 w-3" />
                  Preview
                </button>
              </div>
            </div>
          </div>

          {/* Formatting Toolbar */}
          {activeTab === "write" && (
            <div className="flex flex-wrap items-center gap-1 p-1 bg-background-secondary/10 border border-input border-b-0 rounded-t-sm">
              <button
                type="button"
                onClick={() => insertMarkdown("bold")}
                title="Bold"
                className="p-1.5 hover:bg-background-secondary rounded-sm text-text-secondary hover:text-wood-dark transition-colors"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("italic")}
                title="Italic"
                className="p-1.5 hover:bg-background-secondary rounded-sm text-text-secondary hover:text-wood-dark transition-colors"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("heading")}
                title="Heading 2"
                className="p-1.5 hover:bg-background-secondary rounded-sm text-text-secondary hover:text-wood-dark transition-colors"
              >
                <Heading2 className="h-4 w-4" />
              </button>
              <div className="h-4 w-px bg-border mx-1" />
              <button
                type="button"
                onClick={() => insertMarkdown("link")}
                title="Link"
                className="p-1.5 hover:bg-background-secondary rounded-sm text-text-secondary hover:text-wood-dark transition-colors"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("blockquote")}
                title="Blockquote"
                className="p-1.5 hover:bg-background-secondary rounded-sm text-text-secondary hover:text-wood-dark transition-colors"
              >
                <Quote className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("list")}
                title="List Item"
                className="p-1.5 hover:bg-background-secondary rounded-sm text-text-secondary hover:text-wood-dark transition-colors"
              >
                <ListIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("image")}
                title="Image Markdown"
                className="p-1.5 hover:bg-background-secondary rounded-sm text-text-secondary hover:text-wood-dark transition-colors"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Text Editor Area */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              id="content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={isPending}
              rows={16}
              placeholder="Write article content in Markdown format. Use toolbar above to style your content."
              style={{ display: activeTab === "write" ? "block" : "none" }}
              className="flex w-full rounded-b-sm rounded-t-none border border-input bg-transparent px-3 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-serif leading-relaxed"
            />

            {activeTab === "preview" && (
              <div className="min-h-[354px] w-full rounded-sm border border-input bg-background-secondary/5 px-4 py-4 overflow-y-auto max-h-[500px]">
                {content.trim() ? (
                  <article 
                    className="prose prose-stone max-w-none text-left"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
                  />
                ) : (
                  <p className="text-sm text-text-secondary italic">Nothing to preview yet. Start writing in the editor.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cover Image */}
        <ImagePreviewInput
          id="coverImageUrl"
          name="coverImageUrl"
          label="Cover Image"
          defaultValue={initialData?.coverImageUrl || ""}
          aspectRatio="video"
        />

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
