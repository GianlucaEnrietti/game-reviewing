"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

type ToolbarAction = {
  label: string;
  title: string;
  apply: (selected: string) => { text: string; cursorOffset?: number };
};

const actions: ToolbarAction[] = [
  {
    label: "B",
    title: "Negrita",
    apply: (s) => ({ text: `**${s || "texto"}**` }),
  },
  {
    label: "I",
    title: "Cursiva",
    apply: (s) => ({ text: `_${s || "texto"}_` }),
  },
  {
    label: "H2",
    title: "Encabezado",
    apply: (s) => ({ text: `## ${s || "Título"}` }),
  },
  {
    label: "•",
    title: "Lista",
    apply: (s) => ({ text: `- ${s || "elemento"}` }),
  },
  {
    label: "🔗",
    title: "Enlace",
    apply: (s) => ({ text: `[${s || "texto"}](https://)` }),
  },
];

export default function MarkdownEditor({ value, onChange }: Props) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function applyAction(action: ToolbarAction) {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const { text } = action.apply(selected);
    const next = value.slice(0, start) + text + value.slice(end);

    onChange(next);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = start + text.length;
      textarea.selectionEnd = start + text.length;
    });
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-800 px-2 py-2">
        <div className="flex items-center gap-1">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              title={action.title}
              onClick={() => applyAction(action)}
              className="rounded px-2 py-1 text-sm text-slate-200 hover:bg-slate-800"
            >
              {action.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 text-sm">
          <button
            type="button"
            onClick={() => setTab("write")}
            className={`rounded px-2 py-1 ${
              tab === "write"
                ? "bg-slate-800 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Escribir
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`rounded px-2 py-1 ${
              tab === "preview"
                ? "bg-slate-800 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Vista previa
          </button>
        </div>
      </div>

      {tab === "write" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={16}
          placeholder="Escribe la reseña en Markdown..."
          className="block w-full resize-y bg-transparent px-3 py-3 font-mono text-sm text-slate-100 outline-none"
        />
      ) : (
        <div className="prose prose-invert max-w-none px-4 py-4">
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-slate-500">Nada para previsualizar todavía.</p>
          )}
        </div>
      )}
    </div>
  );
}
