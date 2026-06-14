/**
 * Lightweight, secure Markdown-to-HTML parser and helper utility.
 */

export function parseMarkdown(markdown: string | null | undefined): string {
  if (!markdown) return "";

  // 1. Escape HTML special characters to prevent XSS
  let html = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 2. Restore blockquote marker (so we can parse them securely)
  html = html.replace(/^&gt;\s+(.*)$/gm, "> $1");

  // 3. Process structural elements
  html = html
    // Headers
    .replace(/^### (.*)$/gm, '<h3 class="font-heading text-xl font-medium text-wood-dark mt-6 mb-3">$1</h3>')
    .replace(/^## (.*)$/gm, '<h2 class="font-heading text-2xl font-medium text-wood-dark mt-8 mb-4">$1</h2>')
    .replace(/^# (.*)$/gm, '<h1 class="font-heading text-3xl font-medium text-wood-dark mt-10 mb-6">$1</h1>')
    // Images: ![alt](url)
    .replace(
      /!\[(.*?)\]\((.*?)\)/g,
      '<div class="my-8 overflow-hidden rounded-sm border border-border/10 bg-background-secondary/5"><img src="$2" alt="$1" class="w-full object-cover max-h-[500px]" /><div class="px-4 py-2 bg-background-secondary/10 text-xs text-text-secondary border-t border-border/5">$1</div></div>'
    )
    // Links: [text](url)
    .replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" class="text-wood-medium underline hover:text-wood-dark transition-colors" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    // Bold: **text**
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Italic: *text*
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Blockquotes: > text
    .replace(
      /^>\s+(.*)$/gm,
      '<blockquote class="border-l-4 border-wood-medium pl-6 py-2 my-8 italic text-text-secondary font-serif text-lg leading-relaxed bg-background-secondary/5 rounded-r-sm">$1</blockquote>'
    )
    // Unordered lists: - or * or • item
    .replace(/^[\-\*•]\s+(.*)$/gm, '<li class="list-disc-item">$1</li>')
    // Ordered lists: 1. or 2. item
    .replace(/^\d+\.\s+(.*)$/gm, '<li class="list-decimal-item">$1</li>');

  // 4. Wrap adjacent <li> tags inside a single <ul> or <ol> block
  html = html
    .replace(/(<li class="list-disc-item">[\s\S]*?<\/li>\s*)+/g, (match) => {
      const cleanHtml = match.replace(/class="list-disc-item"/g, 'class="my-2 text-text-secondary leading-relaxed"');
      return `<ul class="my-6 space-y-1 list-disc pl-6">${cleanHtml}</ul>`;
    })
    .replace(/(<li class="list-decimal-item">[\s\S]*?<\/li>\s*)+/g, (match) => {
      const cleanHtml = match.replace(/class="list-decimal-item"/g, 'class="my-2 text-text-secondary leading-relaxed"');
      return `<ol class="my-6 space-y-1 list-decimal pl-6">${cleanHtml}</ol>`;
    });

  // 5. Wrap standalone text sections inside paragraph tags <p>
  const blocks = html.split(/\n\s*\n/);
  const parsedBlocks = blocks.map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return "";

    // If it's already an HTML block element we parsed, don't wrap in <p>
    if (
      trimmed.startsWith("<h") ||
      trimmed.startsWith("<ul") ||
      trimmed.startsWith("<ol") ||
      trimmed.startsWith("<li") ||
      trimmed.startsWith("<blockquote") ||
      trimmed.startsWith("<div")
    ) {
      return trimmed;
    }

    // Replace single newlines within a paragraph with a space to allow natural word wrapping,
    // unless the line ends with a backslash or double spaces (standard markdown line break).
    const formattedText = trimmed
      .replace(/  \n/g, "<br />")
      .replace(/\\\n/g, "<br />")
      .replace(/\n/g, " ");

    return `<p class="font-serif leading-relaxed text-base md:text-lg text-text-secondary mb-6">${formattedText}</p>`;
  });

  return parsedBlocks.filter(Boolean).join("\n");
}

export function estimateReadingTime(text: string | null | undefined): string {
  if (!text) return "1 min read";
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}
