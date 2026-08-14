"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  AlignLeft,
  Bot,
  Clock,
  Feather,
  Hash,
  MessageSquareText,
  Repeat,
  ShieldAlert,
  Type,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import {
  type AnalysisResult,
  type SpamStats,
  getReadabilityLabel,
  getSpamRiskVariant,
} from "@/lib/textAnalysis";
import { type AiDetectionResult } from "@/lib/aiDetection";

interface MetricsPanelProps {
  analysis: AnalysisResult;
  spam: SpamStats;
  text: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Type;
  label: string;
  value: string | number;
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="p-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Icon className="h-4 w-4" strokeWidth={2} />
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      </Card>
    </motion.div>
  );
}

function StyleIssueCard({
  icon: Icon,
  label,
  count,
  description,
}: {
  icon: typeof Type;
  label: string;
  count: number;
  description: string;
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
            <Icon className="h-4.5 w-4.5 text-indigo-600" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{label}</p>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>
        <span className="text-xl font-semibold text-slate-900">{count}</span>
      </Card>
    </motion.div>
  );
}

const SPAM_BAR_COLOR: Record<SpamStats["riskLevel"], string> = {
  Low: "bg-emerald-500",
  Medium: "bg-amber-500",
  High: "bg-red-500",
};

function SpamRiskCard({ spam }: { spam: SpamStats }) {
  const variant = getSpamRiskVariant(spam.riskLevel);

  return (
    <motion.div variants={itemVariants}>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-slate-400" strokeWidth={2} />
            <p className="text-xs font-medium text-slate-400">Spam Risk Score</p>
          </div>
          <Badge variant={variant}>{spam.riskLevel} risk</Badge>
        </div>

        <motion.div
          key={spam.riskScore}
          initial={{ opacity: 0.4, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mt-1 flex items-baseline gap-2"
        >
          <span className="text-4xl font-bold tracking-tight text-slate-900">{spam.riskScore}</span>
          <span className="text-sm font-medium text-slate-400">/ 100</span>
        </motion.div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <motion.div
            className={`h-full rounded-full ${SPAM_BAR_COLOR[spam.riskLevel]}`}
            initial={false}
            animate={{ width: `${spam.riskScore}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-semibold text-slate-900">{spam.detectedWords.length}</p>
            <p className="text-[11px] text-slate-400">spam words</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">{spam.allCapsWordCount + spam.allCapsSentenceCount}</p>
            <p className="text-[11px] text-slate-400">ALL CAPS hits</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">{spam.excessiveExclamationCount}</p>
            <p className="text-[11px] text-slate-400">!! punctuation</p>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.5} />
            Detected Triggers
          </p>

          {spam.detectedWords.length === 0 ? (
            <p className="text-xs text-slate-400">No spam trigger words detected.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              <AnimatePresence mode="popLayout">
                {spam.detectedWords.map((hit) => (
                  <motion.span
                    key={hit.word}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-200"
                  >
                    {hit.word}
                    {hit.count > 1 && <span className="text-rose-400">×{hit.count}</span>}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

const AI_VARIANT: Record<AiDetectionResult["classification"], "success" | "warning" | "danger"> = {
  "Likely Human": "success",
  Uncertain: "warning",
  "Likely AI-Generated": "danger",
};

const AI_BAR_COLOR: Record<AiDetectionResult["classification"], string> = {
  "Likely Human": "bg-emerald-500",
  Uncertain: "bg-amber-500",
  "Likely AI-Generated": "bg-red-500",
};

function useAiDetection(text: string) {
  const [result, setResult] = useState<AiDetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const trimmed = text.trim();

  useEffect(() => {
    if (!trimmed) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/analyze-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed }),
          signal: controller.signal,
        });
        if (res.ok) setResult(await res.json());
      } catch {
        // aborted or network error — leave the previous result in place
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  return { result: trimmed ? result : null, loading: trimmed ? loading : false };
}

function AiProbabilityCard({ text }: { text: string }) {
  const { result, loading } = useAiDetection(text);

  return (
    <motion.div variants={itemVariants}>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-slate-400" strokeWidth={2} />
            <p className="text-xs font-medium text-slate-400">AI Probability</p>
          </div>
          {result && <Badge variant={AI_VARIANT[result.classification]}>{result.classification}</Badge>}
        </div>

        {!result ? (
          <p className="mt-2 text-sm text-slate-400">
            {loading ? "Analyzing..." : "Start writing to see the AI-detection score."}
          </p>
        ) : (
          <>
            <motion.div
              key={result.ai_probability}
              initial={{ opacity: 0.4, scale: 0.96 }}
              animate={{ opacity: loading ? 0.5 : 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mt-1 flex items-baseline gap-2"
            >
              <span className="text-4xl font-bold tracking-tight text-slate-900">
                {result.ai_probability}%
              </span>
            </motion.div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className={`h-full rounded-full ${AI_BAR_COLOR[result.classification]}`}
                initial={false}
                animate={{ width: `${result.ai_probability}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-lg font-semibold text-slate-900">{result.perplexity}</p>
                <p className="text-[11px] text-slate-400">perplexity</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">{result.burstiness}</p>
                <p className="text-[11px] text-slate-400">burstiness</p>
              </div>
            </div>
          </>
        )}
      </Card>
    </motion.div>
  );
}

export default function MetricsPanel({ analysis, spam, text }: MetricsPanelProps) {
  const readability = getReadabilityLabel(analysis.fleschKincaidGrade);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-4 lg:h-full lg:overflow-y-auto lg:pr-1"
    >
      <motion.div variants={itemVariants}>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Reading Grade Level</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-slate-900">
                  {analysis.fleschKincaidGrade}
                </span>
                <span className="text-sm font-medium text-slate-400">grade</span>
              </div>
            </div>
            <Badge variant={readability.variant}>{readability.label}</Badge>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className={`h-full rounded-full ${
                readability.variant === "success"
                  ? "bg-emerald-500"
                  : readability.variant === "warning"
                    ? "bg-amber-500"
                    : "bg-red-500"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (analysis.fleschKincaidGrade / 18) * 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Reading ease score: {analysis.fleschReadingEase}/100
          </p>
        </Card>
      </motion.div>

      <SpamRiskCard spam={spam} />
      <AiProbabilityCard text={text} />

      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={Type} label="Words" value={analysis.wordCount} />
        <StatCard icon={MessageSquareText} label="Sentences" value={analysis.sentenceCount} />
        <StatCard icon={AlignLeft} label="Paragraphs" value={analysis.paragraphCount} />
        <StatCard icon={Clock} label="Reading Time" value={`${analysis.readingTimeMinutes} min`} />
      </div>

      <div>
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <Hash className="h-3.5 w-3.5" strokeWidth={2.5} />
          Style Issues
        </h3>
        <div className="space-y-3">
          <StyleIssueCard
            icon={Feather}
            label="Adverbs"
            count={analysis.adverbCount}
            description="Words ending in 'ly'"
          />
          <StyleIssueCard
            icon={Repeat}
            label="Passive Voice"
            count={analysis.passiveVoiceCount}
            description="Auxiliary + past participle"
          />
          <StyleIssueCard
            icon={AlignLeft}
            label="Hard Sentences"
            count={analysis.hardSentenceCount + analysis.veryHardSentenceCount}
            description={`${analysis.veryHardSentenceCount} very hard to read`}
          />
        </div>
      </div>
    </motion.div>
  );
}
