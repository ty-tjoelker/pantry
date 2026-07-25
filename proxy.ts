import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "pantry_session";

export function proxy(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  if (session === process.env.PANTRY_PASSCODE) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico|icons|manifest).*)"],
};
