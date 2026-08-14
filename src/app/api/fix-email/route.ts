import { NextRequest, NextResponse } from "next/server";
import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import { addLog } from "@/lib/logStore";

const FIXED_EMAIL_SCHEMA = {
  type: "object",
  properties: {
    subject: { type: "string", description: "The rewritten, improved subject line." },
    body: { type: "string", description: "The rewritten, improved email body." },
  },
  required: ["subject", "body"],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = `You are a senior email copywriter and deliverability expert working inside CopyMaster.
Rewrite the given marketing email's subject line and body to:
- fix grammar, spelling, and awkward phrasing
- improve clarity and readability (shorter sentences, active voice, fewer adverbs)
- reduce spam-filter risk (remove or soften spam trigger words, ALL CAPS shouting, excessive "!!!" punctuation)
Preserve the original intent, offer, and any links or placeholders exactly as given. Do not invent new claims, prices, discounts, or facts that weren't in the original. Keep roughly the same length unless shortening clearly improves it.`;

function wordCount(text: string): number {
  return (text.match(/[A-Za-z']+/g) || []).length;
}

export async function POST(request: NextRequest) {
  let payload: { subject?: unknown; body?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const subject = typeof payload.subject === "string" ? payload.subject : "";
  const body = typeof payload.body === "string" ? payload.body : "";

  if (!body.trim()) {
    return NextResponse.json({ error: "Email body is required." }, { status: 400 });
  }

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "medium",
        format: { type: "json_schema", schema: FIXED_EMAIL_SCHEMA },
      },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Subject: ${subject || "(no subject provided)"}\n\nBody:\n${body}`,
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json({ error: "The request was declined." }, { status: 422 });
    }

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No content returned by the model." }, { status: 502 });
    }

    const fixed = JSON.parse(textBlock.text) as { subject: string; body: string };

    addLog({
      action: "fix",
      model: CLAUDE_MODEL,
      subjectBefore: subject,
      subjectAfter: fixed.subject,
      bodyPreviewBefore: body.slice(0, 160),
      bodyPreviewAfter: fixed.body.slice(0, 160),
      wordCountBefore: wordCount(body),
      wordCountAfter: wordCount(fixed.body),
    });

    return NextResponse.json({ subject: fixed.subject, body: fixed.body });
  } catch (error) {
    console.error("[/api/fix-email]", error);
    return NextResponse.json({ error: "Failed to fix email." }, { status: 500 });
  }
}
