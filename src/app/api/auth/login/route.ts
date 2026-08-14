import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE_NAME, verifyCredentials } from "@/lib/auth";

export async function POST(request: NextRequest) {
  let payload: { name?: unknown; password?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = typeof payload.name === "string" ? payload.name : "";
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!verifyCredentials(name, password)) {
    return NextResponse.json({ error: "Invalid name or password." }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);
  return response;
}
