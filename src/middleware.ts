import { NextRequest, NextResponse } from "next/server";

const SNAP_MEDIA_TYPE = "application/vnd.farcaster.snap+json";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

export function middleware(request: NextRequest) {
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  const accept = request.headers.get("accept") || "";
  const { pathname } = request.nextUrl;

  // Snap content negotiation
  if (accept.includes(SNAP_MEDIA_TYPE)) {
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/api/snap";
      const res = NextResponse.rewrite(url);
      res.headers.set("Vary", "Accept");
      Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    }

    const quoteMatch = pathname.match(/^\/quote\/(0x[a-fA-F0-9]+)$/);
    if (quoteMatch) {
      const url = request.nextUrl.clone();
      url.pathname = `/api/snap/${quoteMatch[1]}`;
      const res = NextResponse.rewrite(url);
      res.headers.set("Vary", "Accept");
      Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    }
  }

  // Add CORS to /api/snap routes regardless
  if (pathname.startsWith("/api/snap")) {
    const res = NextResponse.next();
    Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/quote/:path*", "/api/snap/:path*"],
};
