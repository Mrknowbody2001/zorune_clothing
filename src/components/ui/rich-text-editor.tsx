"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { sanitizeRichText } from "@/lib/rich-text";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaInvalid?: boolean;
};

type ToolbarAction = {
  label: string;
  command?: string;
  value?: string;
  onClick?: () => void;
};

const toolbarActions: ToolbarAction[] = [
  { label: "Paragraph", command: "formatBlock", value: "p" },
  { label: "H2", command: "formatBlock", value: "h2" },
  { label: "H3", command: "formatBlock", value: "h3" },
  { label: "Bold", command: "bold" },
  { label: "Italic", command: "italic" },
  { label: "Underline", command: "underline" },
  { label: "Bullets", command: "insertUnorderedList" },
  { label: "Numbers", command: "insertOrderedList" },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  ariaInvalid,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const sanitizedValue = sanitizeRichText(value);
    if (editor.innerHTML !== sanitizedValue) {
      editor.innerHTML = sanitizedValue;
    }
  }, [value]);

  const syncValue = () => {
    const editor = editorRef.current;
    if (!editor) return;
    onChange(sanitizeRichText(editor.innerHTML));
  };

  const runCommand = (action: ToolbarAction) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    if (action.onClick) {
      action.onClick();
    } else if (action.command) {
      document.execCommand(action.command, false, action.value);
    }

    syncValue();
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-white",
        ariaInvalid ? "border-red-300" : "border-zinc-200"
      )}
    >
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 bg-zinc-50 p-3">
        {toolbarActions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => runCommand(action)}
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
          >
            {action.label}
          </button>
        ))}
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncValue}
        onBlur={syncValue}
        data-placeholder={placeholder}
        className={cn(
          "rich-text-editor min-h-40 px-4 py-3 text-sm text-zinc-900 outline-none",
          "[&:empty:before]:pointer-events-none [&:empty:before]:text-zinc-400 [&:empty:before]:content-[attr(data-placeholder)]"
        )}
      />
    </div>
  );
}
