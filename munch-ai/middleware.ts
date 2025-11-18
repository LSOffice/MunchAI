import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // If no token or token is marked invalid (user was deleted), redirect to login
  if (!token || (token as any)?.invalid) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    // Preserve intended destination in query for redirect-after-login
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inventory/:path*",
    "/saved/:path*",
    "/settings/:path*",
    "/api/user/:path*",
    "/api/ingredients/:path*", // protect write via handler too, but this restricts pages calling it unauthenticated
  ],
};
