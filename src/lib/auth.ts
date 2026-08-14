// Server-only. Uses Web Crypto (not node:crypto) so it works in both
// the Edge middleware runtime and ordinary Node route handlers.

export const SESSION_COOKIE_NAME = "copymaster_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function expectedSessionToken(): Promise<string> {
  const name = process.env.AUTH_NAME ?? "";
  const password = process.env.AUTH_PASSWORD ?? "";
  const secret = process.env.AUTH_SESSION_SECRET ?? "";
  return sha256Hex(`${name}:${password}:${secret}`);
}

export function verifyCredentials(name: string, password: string): boolean {
  const expectedName = process.env.AUTH_NAME?.trim() ?? "";
  const expectedPassword = process.env.AUTH_PASSWORD?.trim() ?? "";
  return name.trim() === expectedName && password === expectedPassword;
}

export async function createSessionToken(): Promise<string> {
  return expectedSessionToken();
}

export async function isValidSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  return token === (await expectedSessionToken());
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};
