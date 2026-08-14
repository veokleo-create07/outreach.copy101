// Lightweight NLP-style heuristics for readability, style, and deliverability analysis.
// No external dependencies — everything below is plain regex/string math.

export type Difficulty = "normal" | "hard" | "very-hard";
export type SpamRiskLevel = "Low" | "Medium" | "High";

export interface SpamWordHit {
  word: string;
  count: number;
}

export interface SpamStats {
  riskScore: number;
  riskLevel: SpamRiskLevel;
  detectedWords: SpamWordHit[];
  allCapsWordCount: number;
  allCapsSentenceCount: number;
  excessiveExclamationCount: number;
}

export interface SpamAnalysisResult extends SpamStats {
  highlightedHtml: string;
}

export interface AnalysisResult {
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  characterCount: number;
  paragraphCount: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
  fleschKincaidGrade: number;
  fleschReadingEase: number;
  readingTimeMinutes: number;
  adverbCount: number;
  passiveVoiceCount: number;
  hardSentenceCount: number;
  veryHardSentenceCount: number;
  highlightedHtml: string;
  spam: SpamStats;
}

const ADVERB_BLACKLIST = new Set([
  "only",
  "family",
  "apply",
  "reply",
  "supply",
  "imply",
  "comply",
  "multiply",
  "rely",
  "ugly",
  "early",
  "holy",
  "jelly",
  "belly",
  "silly",
  "ally",
  "italy",
]);

const PASSIVE_AUX = ["am", "is", "are", "was", "were", "be", "been", "being"];

const IRREGULAR_PARTICIPLES = [
  "written",
  "done",
  "made",
  "seen",
  "taken",
  "given",
  "known",
  "shown",
  "chosen",
  "built",
  "sent",
  "kept",
  "held",
  "brought",
  "bought",
  "caught",
  "taught",
  "thought",
  "found",
  "told",
  "sold",
  "felt",
  "meant",
  "put",
  "set",
  "cut",
  "hit",
  "hurt",
  "cost",
  "spread",
  "said",
  "paid",
  "laid",
  "read",
  "led",
  "left",
  "lost",
  "met",
  "run",
  "come",
  "become",
  "begun",
  "broken",
  "drawn",
  "driven",
  "eaten",
  "fallen",
  "forgotten",
  "frozen",
  "gotten",
  "hidden",
  "ridden",
  "risen",
  "spoken",
  "stolen",
  "sworn",
  "torn",
  "worn",
  "woven",
  "understood",
];

// Common phrases that trigger Google/Microsoft spam & promotions filters.
export const SPAM_TRIGGER_WORDS: string[] = [
  "free",
  "100% free",
  "free trial",
  "free gift",
  "free access",
  "free consultation",
  "free installation",
  "free membership",
  "free money",
  "free offer",
  "free quote",
  "free sample",
  "act now",
  "apply now",
  "buy now",
  "call now",
  "click here",
  "click below",
  "order now",
  "subscribe now",
  "sign up free",
  "register now",
  "limited time",
  "limited time offer",
  "limited supply",
  "limited number",
  "act immediately",
  "urgent",
  "urgent response needed",
  "immediate response required",
  "guarantee",
  "guaranteed",
  "satisfaction guaranteed",
  "100% guaranteed",
  "money back",
  "money-back guarantee",
  "no obligation",
  "no strings attached",
  "no credit check",
  "no fees",
  "no hidden costs",
  "no hidden fees",
  "no purchase necessary",
  "no catch",
  "no cost",
  "risk-free",
  "risk free",
  "winner",
  "you have been selected",
  "you are a winner",
  "congratulations",
  "cash bonus",
  "extra cash",
  "earn extra cash",
  "easy money",
  "make money",
  "make money fast",
  "fast cash",
  "get paid",
  "double your income",
  "additional income",
  "be your own boss",
  "work from home",
  "home based business",
  "eliminate debt",
  "eliminate bad credit",
  "credit card offers",
  "lowest price",
  "lowest interest rate",
  "special promotion",
  "exclusive deal",
  "best price",
  "bargain",
  "cheap",
  "discount",
  "save big",
  "save up to",
  "compare rates",
  "as seen on",
  "as advertised",
  "dear friend",
  "this is not spam",
  "not spam",
  "opt in",
  "unsubscribe",
  "one time offer",
  "once in a lifetime",
  "prize",
  "giveaway",
  "miracle",
  "amazing",
  "incredible deal",
  "supplies are limited",
  "while supplies last",
  "expires today",
  "expire immediately",
  "avoid bankruptcy",
  "increase sales",
  "increase traffic",
  "double your sales",
  "pure profit",
  "investment opportunity",
  "no investment required",
  "bonus",
  "instant access",
  "instant cash",
  "weight loss",
  "lose weight fast",
];

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const passiveRegex = new RegExp(
  `\\b(${PASSIVE_AUX.join("|")})\\b(\\s+\\w+ly)?\\s+(\\w+ed\\b|\\b(?:${IRREGULAR_PARTICIPLES.join("|")})\\b)`,
  "gi",
);

const adverbRegex = /\b[A-Za-z]+ly\b/g;

// Longest phrases first so multi-word triggers win over their substrings.
const sortedSpamWords = [...SPAM_TRIGGER_WORDS].sort((a, b) => b.length - a.length);
const spamRegex = new RegExp(`\\b(${sortedSpamWords.map(escapeRegExp).join("|")})\\b`, "gi");

// 3+ consecutive uppercase letters — catches shouty words while sparing short acronyms like "OK".
const allCapsWordRegex = /\b[A-Z]{3,}\b/g;

// "!!" or more — a single "!" is normal, but repeated marks read as spammy urgency.
const exclamationRegex = /!{2,}/g;

function isAllCapsSentence(sentence: string): boolean {
  const letters = sentence.replace(/[^A-Za-z]/g, "");
  if (letters.length < 4) return false;
  return /^[A-Z]+$/.test(letters);
}

export function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return 0;
  if (clean.length <= 3) return 1;

  const reduced = clean
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "");

  const matches = reduced.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(matches.length, 1) : 1;
}

function getWords(text: string): string[] {
  return text.match(/[A-Za-z']+/g) || [];
}

function getSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g)?.filter((s) => s.trim().length > 0) || [];
}

type MatchType = "adverb" | "passive" | "spam" | "caps" | "excl";

interface StyleMatch {
  start: number;
  end: number;
  type: MatchType;
  text: string;
}

function addIfNoOverlap(matches: StyleMatch[], start: number, end: number, type: MatchType, text: string) {
  const overlaps = matches.some((m) => start < m.end && end > m.start);
  if (!overlaps) matches.push({ start, end, type, text });
}

/** Priority order: spam > passive > adverb > shouty caps > excessive punctuation. */
function findAllMatches(sentence: string): StyleMatch[] {
  const matches: StyleMatch[] = [];
  let m: RegExpExecArray | null;

  spamRegex.lastIndex = 0;
  while ((m = spamRegex.exec(sentence)) !== null) {
    addIfNoOverlap(matches, m.index, m.index + m[0].length, "spam", m[0]);
    if (m[0].length === 0) spamRegex.lastIndex++;
  }

  passiveRegex.lastIndex = 0;
  while ((m = passiveRegex.exec(sentence)) !== null) {
    addIfNoOverlap(matches, m.index, m.index + m[0].length, "passive", m[0]);
    if (m[0].length === 0) passiveRegex.lastIndex++;
  }

  adverbRegex.lastIndex = 0;
  while ((m = adverbRegex.exec(sentence)) !== null) {
    const word = m[0].toLowerCase();
    if (!ADVERB_BLACKLIST.has(word)) {
      addIfNoOverlap(matches, m.index, m.index + m[0].length, "adverb", m[0]);
    }
  }

  allCapsWordRegex.lastIndex = 0;
  while ((m = allCapsWordRegex.exec(sentence)) !== null) {
    addIfNoOverlap(matches, m.index, m.index + m[0].length, "caps", m[0]);
  }

  exclamationRegex.lastIndex = 0;
  while ((m = exclamationRegex.exec(sentence)) !== null) {
    addIfNoOverlap(matches, m.index, m.index + m[0].length, "excl", m[0]);
  }

  return matches.sort((a, b) => a.start - b.start);
}

const MARK_CLASSES: Record<MatchType, string> = {
  passive: "bg-blue-200/70 rounded",
  adverb: "bg-purple-200/70 rounded",
  spam: "bg-rose-300/80 rounded ring-1 ring-rose-400/70",
  caps: "bg-orange-200/70 rounded",
  excl: "bg-fuchsia-200/70 rounded",
};

function renderMatches(text: string, matches: StyleMatch[]): string {
  let out = "";
  let cursor = 0;
  for (const match of matches) {
    out += escapeHtml(text.slice(cursor, match.start));
    out += `<mark class="${MARK_CLASSES[match.type]}">${escapeHtml(text.slice(match.start, match.end))}</mark>`;
    cursor = match.end;
  }
  out += escapeHtml(text.slice(cursor));
  return out;
}

function buildSentenceHtml(sentence: string, difficulty: Difficulty): string {
  const out = renderMatches(sentence, findAllMatches(sentence));

  // box-shadow (not border) so the underline paints without adding to the line-box
  // height — a height mismatch here would drift the backdrop out of sync with the
  // textarea on scroll, since the invisible textarea text never gets the extra pixels.
  if (difficulty === "hard") {
    return `<span class="bg-yellow-100/80 shadow-[inset_0_-2px_0_0_rgba(234,179,8,0.7)]">${out}</span>`;
  }
  if (difficulty === "very-hard") {
    return `<span class="bg-red-100/80 shadow-[inset_0_-2px_0_0_rgba(239,68,68,0.7)]">${out}</span>`;
  }
  return out;
}

function computeSpamRiskScore(input: {
  uniqueSpamWords: number;
  totalSpamHits: number;
  allCapsWordCount: number;
  allCapsSentenceCount: number;
  excessiveExclamationCount: number;
}): { score: number; level: SpamRiskLevel } {
  let score = 0;
  score += Math.min(40, input.uniqueSpamWords * 6);
  score += Math.min(20, input.totalSpamHits * 3);
  score += Math.min(15, input.allCapsWordCount * 3);
  score += Math.min(15, input.allCapsSentenceCount * 8);
  score += Math.min(10, input.excessiveExclamationCount * 5);

  const riskScore = Math.min(100, Math.round(score));
  const level: SpamRiskLevel = riskScore <= 25 ? "Low" : riskScore <= 55 ? "Medium" : "High";
  return { score: riskScore, level };
}

const emptySpamStats: SpamStats = {
  riskScore: 0,
  riskLevel: "Low",
  detectedWords: [],
  allCapsWordCount: 0,
  allCapsSentenceCount: 0,
  excessiveExclamationCount: 0,
};

const emptyResult: AnalysisResult = {
  wordCount: 0,
  sentenceCount: 0,
  syllableCount: 0,
  characterCount: 0,
  paragraphCount: 0,
  avgWordsPerSentence: 0,
  avgSyllablesPerWord: 0,
  fleschKincaidGrade: 0,
  fleschReadingEase: 0,
  readingTimeMinutes: 0,
  adverbCount: 0,
  passiveVoiceCount: 0,
  hardSentenceCount: 0,
  veryHardSentenceCount: 0,
  highlightedHtml: "",
  spam: emptySpamStats,
};

export function analyzeText(text: string): AnalysisResult {
  if (!text || !text.trim()) return emptyResult;

  const words = getWords(text);
  const wordCount = words.length;
  const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const characterCount = text.replace(/\s/g, "").length;
  const paragraphCount = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length || (wordCount > 0 ? 1 : 0);

  let adverbCount = 0;
  let passiveVoiceCount = 0;
  let hardSentenceCount = 0;
  let veryHardSentenceCount = 0;
  let sentenceCount = 0;
  let allCapsWordCount = 0;
  let allCapsSentenceCount = 0;
  let excessiveExclamationCount = 0;
  const spamWordMap = new Map<string, number>();

  const lines = text.split(/(\n)/);
  const htmlParts: string[] = [];

  for (const line of lines) {
    if (line === "\n") {
      htmlParts.push("\n");
      continue;
    }
    if (line === "") continue;

    const sentences = getSentences(line);
    if (sentences.length === 0) {
      htmlParts.push(escapeHtml(line));
      continue;
    }

    for (const sentence of sentences) {
      sentenceCount += 1;
      const sentenceWordCount = getWords(sentence).length;

      let difficulty: Difficulty = "normal";
      if (sentenceWordCount >= 28) {
        difficulty = "very-hard";
        veryHardSentenceCount += 1;
      } else if (sentenceWordCount >= 20) {
        difficulty = "hard";
        hardSentenceCount += 1;
      }

      if (isAllCapsSentence(sentence)) allCapsSentenceCount += 1;

      const matches = findAllMatches(sentence);
      for (const match of matches) {
        if (match.type === "adverb") adverbCount += 1;
        else if (match.type === "passive") passiveVoiceCount += 1;
        else if (match.type === "caps") allCapsWordCount += 1;
        else if (match.type === "excl") excessiveExclamationCount += 1;
        else if (match.type === "spam") {
          const key = match.text.toLowerCase();
          spamWordMap.set(key, (spamWordMap.get(key) || 0) + 1);
        }
      }

      htmlParts.push(buildSentenceHtml(sentence, difficulty));
    }
  }

  const safeSentenceCount = Math.max(sentenceCount, 1);
  const safeWordCount = Math.max(wordCount, 1);

  const avgWordsPerSentence = wordCount / safeSentenceCount;
  const avgSyllablesPerWord = syllableCount / safeWordCount;

  const fleschKincaidGradeRaw = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
  const fleschReadingEaseRaw = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

  const detectedWords: SpamWordHit[] = Array.from(spamWordMap.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));

  const { score, level } = computeSpamRiskScore({
    uniqueSpamWords: detectedWords.length,
    totalSpamHits: detectedWords.reduce((sum, w) => sum + w.count, 0),
    allCapsWordCount,
    allCapsSentenceCount,
    excessiveExclamationCount,
  });

  return {
    wordCount,
    sentenceCount,
    syllableCount,
    characterCount,
    paragraphCount,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 10) / 10,
    fleschKincaidGrade: Math.max(0, Math.round(fleschKincaidGradeRaw * 10) / 10),
    fleschReadingEase: Math.min(100, Math.max(0, Math.round(fleschReadingEaseRaw))),
    readingTimeMinutes: Math.max(1, Math.round(wordCount / 200)),
    adverbCount,
    passiveVoiceCount,
    hardSentenceCount,
    veryHardSentenceCount,
    highlightedHtml: htmlParts.join(""),
    spam: {
      riskScore: score,
      riskLevel: level,
      detectedWords,
      allCapsWordCount,
      allCapsSentenceCount,
      excessiveExclamationCount,
    },
  };
}

/** Spam-only pass (no readability/adverb/passive checks) — used for short fields like a subject line. */
export function analyzeSpamRisk(text: string): SpamAnalysisResult {
  if (!text || !text.trim()) return { ...emptySpamStats, highlightedHtml: "" };

  const matches: StyleMatch[] = [];
  let m: RegExpExecArray | null;

  spamRegex.lastIndex = 0;
  while ((m = spamRegex.exec(text)) !== null) {
    addIfNoOverlap(matches, m.index, m.index + m[0].length, "spam", m[0]);
    if (m[0].length === 0) spamRegex.lastIndex++;
  }

  allCapsWordRegex.lastIndex = 0;
  while ((m = allCapsWordRegex.exec(text)) !== null) {
    addIfNoOverlap(matches, m.index, m.index + m[0].length, "caps", m[0]);
  }

  exclamationRegex.lastIndex = 0;
  while ((m = exclamationRegex.exec(text)) !== null) {
    addIfNoOverlap(matches, m.index, m.index + m[0].length, "excl", m[0]);
  }

  matches.sort((a, b) => a.start - b.start);

  const spamWordMap = new Map<string, number>();
  let allCapsWordCount = 0;
  let excessiveExclamationCount = 0;
  for (const match of matches) {
    if (match.type === "spam") {
      const key = match.text.toLowerCase();
      spamWordMap.set(key, (spamWordMap.get(key) || 0) + 1);
    } else if (match.type === "caps") allCapsWordCount += 1;
    else if (match.type === "excl") excessiveExclamationCount += 1;
  }

  const sentences = getSentences(text);
  const sentenceList = sentences.length ? sentences : [text];
  const allCapsSentenceCount = sentenceList.filter(isAllCapsSentence).length;

  const detectedWords: SpamWordHit[] = Array.from(spamWordMap.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));

  const { score, level } = computeSpamRiskScore({
    uniqueSpamWords: detectedWords.length,
    totalSpamHits: detectedWords.reduce((sum, w) => sum + w.count, 0),
    allCapsWordCount,
    allCapsSentenceCount,
    excessiveExclamationCount,
  });

  return {
    riskScore: score,
    riskLevel: level,
    detectedWords,
    allCapsWordCount,
    allCapsSentenceCount,
    excessiveExclamationCount,
    highlightedHtml: renderMatches(text, matches),
  };
}

/** Merges body + subject spam stats into one score, weighting subject-line hits more heavily. */
export function combineSpamStats(body: SpamStats, subject: SpamStats): SpamStats {
  const wordMap = new Map<string, number>();
  for (const { word, count } of body.detectedWords) {
    wordMap.set(word, (wordMap.get(word) || 0) + count);
  }
  for (const { word, count } of subject.detectedWords) {
    wordMap.set(word, (wordMap.get(word) || 0) + count);
  }

  const detectedWords: SpamWordHit[] = Array.from(wordMap.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));

  const bodyHits = body.detectedWords.reduce((sum, w) => sum + w.count, 0);
  const subjectHits = subject.detectedWords.reduce((sum, w) => sum + w.count, 0);
  const allCapsWordCount = body.allCapsWordCount + subject.allCapsWordCount;
  const allCapsSentenceCount = body.allCapsSentenceCount + subject.allCapsSentenceCount;
  const excessiveExclamationCount = body.excessiveExclamationCount + subject.excessiveExclamationCount;

  const { score, level } = computeSpamRiskScore({
    uniqueSpamWords: detectedWords.length,
    totalSpamHits: bodyHits + subjectHits * 2,
    allCapsWordCount,
    allCapsSentenceCount,
    excessiveExclamationCount,
  });

  return {
    riskScore: score,
    riskLevel: level,
    detectedWords,
    allCapsWordCount,
    allCapsSentenceCount,
    excessiveExclamationCount,
  };
}

export function getReadabilityLabel(grade: number): {
  label: string;
  variant: "success" | "warning" | "danger";
} {
  if (grade <= 8) return { label: "Good", variant: "success" };
  if (grade <= 12) return { label: "OK", variant: "warning" };
  return { label: "Difficult", variant: "danger" };
}

export function getSpamRiskVariant(level: SpamRiskLevel): "success" | "warning" | "danger" {
  if (level === "Low") return "success";
  if (level === "Medium") return "warning";
  return "danger";
}
