"use client";

import { useMemo, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import TextEditor from "@/components/dashboard/TextEditor";
import SubjectLine from "@/components/dashboard/SubjectLine";
import MetricsPanel from "@/components/dashboard/MetricsPanel";
import HighlightLegend from "@/components/dashboard/HighlightLegend";
import { analyzeText, analyzeSpamRisk, combineSpamStats } from "@/lib/textAnalysis";

const SAMPLE_SUBJECT = "You're leaving money on the table";

const SAMPLE_TEXT = `Subject: You're leaving money on the table

Hi there,

I wanted to reach out because I noticed something. Your last campaign was actually opened by a lot of people, but the results were quietly disappointing.

Most founders assume that more traffic will automatically fix the problem. It won't. The copy itself is usually what's being ignored by readers.

We built a tool that instantly analyzes your writing and flags weak, passive, or overly complex sentences before you hit send. It's simple, it's fast, and it works.

Want to see how your last email scores? Just paste it in.`;

export default function Home() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [subject, setSubject] = useState(SAMPLE_SUBJECT);
  const [isFixing, setIsFixing] = useState(false);
  const [fixError, setFixError] = useState<string | null>(null);

  const analysis = useMemo(() => analyzeText(text), [text]);
  const subjectSpam = useMemo(() => analyzeSpamRisk(subject), [subject]);
  const combinedSpam = useMemo(
    () => combineSpamStats(analysis.spam, subjectSpam),
    [analysis.spam, subjectSpam],
  );

  const handleFixWithAI = async () => {
    if (!text.trim() || isFixing) return;
    setIsFixing(true);
    setFixError(null);
    try {
      const res = await fetch("/api/fix-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fix email.");
      setSubject(data.subject);
      setText(data.body);
    } catch (err) {
      setFixError(err instanceof Error ? err.message : "Failed to fix email.");
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onReset={() => {
            setText("");
            setSubject("");
            setFixError(null);
          }}
          onFix={handleFixWithAI}
          isFixing={isFixing}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:overflow-hidden">
          {fixError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {fixError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:h-full lg:grid-cols-[1.4fr_1fr] lg:gap-6">
            <div className="flex flex-col gap-4 lg:min-h-0">
              <SubjectLine
                subject={subject}
                onChange={setSubject}
                highlightedHtml={subjectSpam.highlightedHtml}
                riskLevel={subjectSpam.riskLevel}
              />
              <TextEditor
                text={text}
                onChange={setText}
                highlightedHtml={analysis.highlightedHtml}
                wordCount={analysis.wordCount}
              />
              <HighlightLegend />
            </div>

            <div className="lg:min-h-0">
              <MetricsPanel analysis={analysis} spam={combinedSpam} text={text} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
