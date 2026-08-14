"use client";

import { useRef } from "react";
import { Mail } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { type SpamRiskLevel, getSpamRiskVariant } from "@/lib/textAnalysis";

interface SubjectLineProps {
  subject: string;
  onChange: (value: string) => void;
  highlightedHtml: string;
  riskLevel: SpamRiskLevel;
}

export default function SubjectLine({ subject, onChange, highlightedHtml, riskLevel }: SubjectLineProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const syncScroll = () => {
    if (backdropRef.current && inputRef.current) {
      backdropRef.current.scrollLeft = inputRef.current.scrollLeft;
    }
  };

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-slate-400" strokeWidth={2} />
          <h2 className="text-sm font-semibold text-slate-900">Subject Line</h2>
        </div>
        {subject.trim() && <Badge variant={getSpamRiskVariant(riskLevel)}>{riskLevel} risk</Badge>}
      </div>

      <div className="relative h-11 overflow-hidden rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/40">
        <div
          ref={backdropRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-pre px-3 font-sans text-sm text-transparent"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
        <textarea
          ref={inputRef}
          value={subject}
          onChange={(e) => onChange(e.target.value.replace(/\n/g, ""))}
          onScroll={syncScroll}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          rows={1}
          spellCheck={false}
          placeholder="Write your subject line..."
          className="absolute inset-0 h-full w-full resize-none overflow-x-auto overflow-y-hidden whitespace-pre bg-transparent px-3 font-sans text-sm text-slate-800 caret-indigo-600 placeholder:text-slate-400 focus:outline-none"
        />
      </div>
    </Card>
  );
}
