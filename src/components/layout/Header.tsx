"use client";

import { Loader2, RotateCcw, Sparkles } from "lucide-react";

interface HeaderProps {
  onReset: () => void;
  onFix: () => void;
  isFixing: boolean;
}

export default function Header({ onReset, onFix, isFixing }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div>
        <h1 className="text-base font-semibold text-slate-900">Copy Analysis Dashboard</h1>
        <p className="text-xs text-slate-500">Real-time readability & style scoring</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onReset}
          disabled={isFixing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" strokeWidth={2} />
          <span className="hidden sm:inline">Clear</span>
        </button>
        <button
          type="button"
          onClick={onFix}
          disabled={isFixing}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:opacity-60"
        >
          {isFixing ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          ) : (
            <Sparkles className="h-4 w-4" strokeWidth={2} />
          )}
          <span className="hidden sm:inline">{isFixing ? "Fixing..." : "Fix with AI"}</span>
        </button>
      </div>
    </header>
  );
}
