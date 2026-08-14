"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, PenSquare, User } from "lucide-react";
import Card from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Invalid name or password.");
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid name or password.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
            <PenSquare className="h-5 w-5 text-white" strokeWidth={2.25} />
          </div>
          <span className="text-xl font-semibold tracking-tight text-slate-900">CopyMaster</span>
        </div>

        <Card className="p-6">
          <h1 className="text-base font-semibold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Enter your name and password to continue.</p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-slate-600">
                Name
              </label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2}
                />
                <input
                  id="name"
                  type="text"
                  autoComplete="username"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-600">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2}
                />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
