import { Bot, History as HistoryIcon } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { getLogs } from "@/lib/logStore";

export const metadata = {
  title: "History — CopyMaster",
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function HistoryPage() {
  const logs = getLogs();

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center border-b border-slate-200 bg-white px-4 sm:px-6">
          <div>
            <h1 className="text-base font-semibold text-slate-900">AI Fix History</h1>
            <p className="text-xs text-slate-500">Every AI-assisted email fix, most recent first</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {logs.length === 0 ? (
            <Card className="flex flex-col items-center gap-2 p-12 text-center">
              <HistoryIcon className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
              <p className="text-sm font-medium text-slate-700">No fixes logged yet</p>
              <p className="text-xs text-slate-400">
                Use &ldquo;Fix with AI&rdquo; on the dashboard to see a record here.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {logs.map((entry) => (
                <Card key={entry.id} className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                        <Bot className="h-4 w-4 text-indigo-600" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">AI Fix</p>
                        <p className="text-xs text-slate-400">{formatTimestamp(entry.timestamp)}</p>
                      </div>
                    </div>
                    <Badge variant="info">{entry.model}</Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Before
                      </p>
                      <p className="mt-1 truncate text-sm font-medium text-slate-700">
                        {entry.subjectBefore || "(no subject)"}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                        {entry.bodyPreviewBefore}
                        {entry.bodyPreviewBefore.length >= 160 ? "…" : ""}
                      </p>
                      <p className="mt-2 text-[11px] text-slate-400">{entry.wordCountBefore} words</p>
                    </div>

                    <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                        After
                      </p>
                      <p className="mt-1 truncate text-sm font-medium text-slate-800">
                        {entry.subjectAfter || "(no subject)"}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                        {entry.bodyPreviewAfter}
                        {entry.bodyPreviewAfter.length >= 160 ? "…" : ""}
                      </p>
                      <p className="mt-2 text-[11px] text-emerald-600">{entry.wordCountAfter} words</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
