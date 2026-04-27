import { NextRequest, NextResponse } from "next/server";

const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

// In-memory store — sufficient for single-instance dev; use Upstash/Redis in production
const ipRequestMap = new Map<string, { count: number; resetAt: number }>();

export function proxy(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/api/game/guess")) {
    return NextResponse.next();
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const now = Date.now();
  const record = ipRequestMap.get(ip);

  if (!record || now > record.resetAt) {
    ipRequestMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return NextResponse.next();
  }

  if (record.count >= MAX_REQUESTS) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  record.count++;
  return NextResponse.next();
}

export const config = {
  matcher: "/api/game/guess",
};
