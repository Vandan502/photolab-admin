import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

const protectedRoutes = ["/dashboard", "/gallery"];
const publicRoutes = ["/login"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = req.cookies.get("session")?.value;
  let session = null;
  let errorMsg = "";
  if (cookie) {
    try {
      session = await decrypt(cookie);
    } catch (error: any) {
      session = null;
      errorMsg = error?.message || "Unknown error";
    }
  }

  // Redirect to login if accessing a protected route without a session
  if (isProtectedRoute && !session?.user) {
    const res = NextResponse.redirect(new URL("/login", req.nextUrl));
    if (errorMsg) res.headers.set("x-debug-error", errorMsg);
    if (cookie) res.headers.set("x-debug-cookie", cookie.substring(0, 10));
    return res;
  }

  // Redirect to dashboard if logged in and trying to access login page
  if (isPublicRoute && session?.user) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
