import { NextRequest, NextResponse } from "next/server";
import { analyzeAiProbability } from "@/lib/aiDetection";

export async function POST(request: NextRequest) {
  let payload: { text?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text = typeof payload.text === "string" ? payload.text : "";
  return NextResponse.json(analyzeAiProbability(text));
}
