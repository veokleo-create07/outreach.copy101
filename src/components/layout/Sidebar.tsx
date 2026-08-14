"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, LayoutDashboard, PenSquare } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "History", href: "/history", icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <PenSquare className="h-4.5 w-4.5 text-white" strokeWidth={2.25} />
        </div>
        <span className="text-lg font-semibold tracking-tight text-slate-900">
          CopyMaster
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4.5 w-4.5" strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-700">Readability Engine</p>
          <p className="mt-1 text-xs text-slate-500">
            Analyzing text locally in real time — no data leaves your browser.
          </p>
        </div>
      </div>
    </aside>
  );
}
