"use client";

import { useRef } from "react";
import { FileText } from "lucide-react";
import Card from "@/components/ui/Card";

interface TextEditorProps {
  text: string;
  onChange: (value: string) => void;
  highlightedHtml: string;
  wordCount: number;
}

export default function TextEditor({ text, onChange, highlightedHtml, wordCount }: TextEditorProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const syncScroll = () => {
    if (backdropRef.current && textareaRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <Card className="flex min-h-[420px] flex-col overflow-hidden lg:h-full">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-400" strokeWidth={2} />
          <h2 className="text-sm font-semibold text-slate-900">Your Copy</h2>
        </div>
        <span className="text-xs font-medium text-slate-400">{wordCount} words</span>
      </div>

      <div className="relative flex-1">
        <div
          ref={backdropRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre-wrap break-words p-5 font-sans text-[15px] leading-relaxed text-transparent"
          dangerouslySetInnerHTML={{ __html: `${highlightedHtml}\n` }}
        />
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          spellCheck={false}
          placeholder="Paste your email copy or article here..."
          className="absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent p-5 font-sans text-[15px] leading-relaxed text-slate-800 caret-indigo-600 placeholder:text-slate-400 focus:outline-none"
        />
      </div>
    </Card>
  );
}
