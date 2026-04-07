import { NextRequest, NextResponse } from "next/server";

const SNAP_MEDIA_TYPE = "application/vnd.farcaster.snap+json";

export function middleware(request: NextRequest) {
  const accept = request.headers.get("accept") || "";
  if (!accept.includes(SNAP_MEDIA_TYPE)) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Root URL → snap input view
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/api/snap";
    const res = NextResponse.rewrite(url);
    res.headers.set("Vary", "Accept");
    return res;
  }

  // /quote/0xabc123 → snap quote view
  const quoteMatch = pathname.match(/^\/quote\/(0x[a-fA-F0-9]+)$/);
  if (quoteMatch) {
    const url = request.nextUrl.clone();
    url.pathname = `/api/snap/${quoteMatch[1]}`;
    const res = NextResponse.rewrite(url);
    res.headers.set("Vary", "Accept");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/quote/:path*"],
};
