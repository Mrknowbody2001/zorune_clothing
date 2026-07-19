import { cn } from "@/lib/utils";
import { isRichTextBlank, sanitizeRichText } from "@/lib/rich-text";

type RichTextContentProps = {
  content: string;
  className?: string;
  emptyMessage?: string;
};

export default function RichTextContent({
  content,
  className,
  emptyMessage,
}: RichTextContentProps) {
  if (isRichTextBlank(content)) {
    if (!emptyMessage) {
      return null;
    }

    return <p className={cn("text-sm text-zinc-500", className)}>{emptyMessage}</p>;
  }

  return (
    <div
      className={cn("rich-text-content", className)}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(content) }}
    />
  );
}
