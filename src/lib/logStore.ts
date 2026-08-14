import fs from "fs";
import path from "path";

// Server-only — never import this file from a "use client" component.

export interface LogEntry {
  id: string;
  timestamp: string;
  action: "fix";
  model: string;
  subjectBefore: string;
  subjectAfter: string;
  bodyPreviewBefore: string;
  bodyPreviewAfter: string;
  wordCountBefore: number;
  wordCountAfter: number;
}

const DATA_DIR = path.join(process.cwd(), "data");
const LOG_FILE = path.join(DATA_DIR, "logs.json");
const MAX_ENTRIES = 200;

function ensureStore(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, "[]", "utf-8");
}

export function getLogs(): LogEntry[] {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(LOG_FILE, "utf-8")) as LogEntry[];
  } catch {
    return [];
  }
}

export function addLog(entry: Omit<LogEntry, "id" | "timestamp">): LogEntry {
  ensureStore();
  const newEntry: LogEntry = {
    ...entry,
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  const logs = [newEntry, ...getLogs()].slice(0, MAX_ENTRIES);
  fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2), "utf-8");
  return newEntry;
}
