import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const userId = token ? await verifySessionToken(token) : null;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard") && !userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if ((pathname === "/login" || pathname === "/register") && userId) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/login", "/register"] };
