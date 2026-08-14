// Mock ZeroGPT-style AI-detection heuristic — no ML model, just sentence-length
// variance ("burstiness") and word-repetition ("perplexity" proxy). Human writing
// tends to vary sentence length a lot and reuse fewer words; AI text tends to be
// more uniform and more repetitive.

export interface AiDetectionResult {
  ai_probability: number;
  perplexity: number;
  burstiness: number;
  classification: "Likely Human" | "Uncertain" | "Likely AI-Generated";
}

function getSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g)?.filter((s) => s.trim().length > 0) || [];
}

function getWords(text: string): string[] {
  return text.match(/[A-Za-z']+/g) || [];
}

export function analyzeAiProbability(text: string): AiDetectionResult {
  const sentences = getSentences(text);
  const words = getWords(text);

  if (sentences.length < 2 || words.length < 15) {
    return { ai_probability: 0, perplexity: 0, burstiness: 0, classification: "Uncertain" };
  }

  const sentenceLengths = sentences.map((s) => getWords(s).length).filter((n) => n > 0);
  const mean = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const variance =
    sentenceLengths.reduce((sum, n) => sum + (n - mean) ** 2, 0) / sentenceLengths.length;
  const stdDev = Math.sqrt(variance);

  // Coefficient of variation — 0 means every sentence is the same length (robotic).
  const burstiness = mean > 0 ? stdDev / mean : 0;

  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
  const lexicalDiversity = uniqueWords.size / words.length;

  const normalizedBurstiness = Math.min(1, burstiness);
  const humanScore = normalizedBurstiness * 0.5 + lexicalDiversity * 0.5;

  const aiProbability = Math.round(Math.min(98, Math.max(2, (1 - humanScore) * 100)));
  const perplexity = Math.round(20 + lexicalDiversity * 80);

  const classification: AiDetectionResult["classification"] =
    aiProbability <= 34 ? "Likely Human" : aiProbability <= 66 ? "Uncertain" : "Likely AI-Generated";

  return {
    ai_probability: aiProbability,
    perplexity,
    burstiness: Math.round(burstiness * 100) / 100,
    classification,
  };
}
