import Anthropic from "@anthropic-ai/sdk";

// Server-only — never import this file from a "use client" component.
// The zero-arg client reads ANTHROPIC_API_KEY from the environment.
export const anthropic = new Anthropic();

export const CLAUDE_MODEL = "claude-sonnet-5";
