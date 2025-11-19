import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAuthSecret } from "@/lib/secrets";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: getAuthSecret() });

  // Debug logging
  const pathname = req.nextUrl.pathname;
  console.log(`[Middleware] Path: ${pathname}, Token exists: ${!!token}`);
  if (!token) {
    console.log(
      `[Middleware] No token found, all cookies:`,
      req.cookies.getAll(),
    );
  }

  // If no token or token is marked invalid (user was deleted), redirect to login
  if (!token || (token as any)?.invalid) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    // Preserve intended destination in query for redirect-after-login
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    console.log(`[Middleware] Redirecting ${pathname} to /login`);
    return NextResponse.redirect(url);
  }

  console.log(`[Middleware] Allowing access to ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/inventory/:path*",
    "/saved/:path*",
    "/settings/:path*",
    "/api/user/:path*",
    "/api/ingredients/:path*", // protect write via handler too, but this restricts pages calling it unauthenticated
  ],
};
