import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add HSTS header in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  // Redirect HTTP to HTTPS
  if (
    process.env.NODE_ENV === "production" &&
    request.headers.get("x-forwarded-proto") === "http"
  ) {
    const url = request.nextUrl;
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  return response;
}

export const config = {
  matcher: "/:path*",
};