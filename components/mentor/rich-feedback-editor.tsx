"use client";

import { useRef, useState } from "react";

interface RichFeedbackEditorProps {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toEditorHtml(value: string) {
  if (!value.trim()) {
    return "";
  }
  const hasHtml = /<[^>]+>/.test(value);
  return hasHtml ? value : escapeHtml(value).replaceAll("\n", "<br>");
}

export function RichFeedbackEditor({ name, defaultValue = "", placeholder }: RichFeedbackEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [html, setHtml] = useState(() => toEditorHtml(defaultValue));

  const runCommand = (command: "bold" | "italic" | "insertUnorderedList") => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    editor.focus();
    document.execCommand(command);
    setHtml(editor.innerHTML);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => runCommand("bold")} className="rounded border border-neutral-300 px-2 py-1 text-[11px] font-semibold text-neutral-700">B</button>
        <button type="button" onClick={() => runCommand("italic")} className="rounded border border-neutral-300 px-2 py-1 text-[11px] font-semibold italic text-neutral-700">I</button>
        <button type="button" onClick={() => runCommand("insertUnorderedList")} className="rounded border border-neutral-300 px-2 py-1 text-[11px] font-semibold text-neutral-700">List</button>
      </div>

      <div className="h-40 resize-y overflow-auto rounded-lg border border-neutral-400 bg-white">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(event) => setHtml(event.currentTarget.innerHTML)}
          className="h-full min-h-full w-full px-3 py-2 text-sm text-neutral-900 focus:outline-none"
          data-placeholder={placeholder ?? "Write feedback..."}
          dangerouslySetInnerHTML={{ __html: toEditorHtml(defaultValue) }}
        />
      </div>

      <input type="hidden" name={name} value={html} />
    </div>
  );
}
