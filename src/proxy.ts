import { NextRequest, NextResponse } from "next/server";
import { isValidSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authed = await isValidSessionToken(token);

  if (!authed) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match everything except:
     * - /login (the login page itself)
     * - /api/auth/* (login/logout endpoints)
     * - Next internals and static assets
     */
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
