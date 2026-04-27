import { NextResponse } from "next/server";
import { getTodayString } from "@/lib/utils/getDailyWord";

// Confirms today's word exists — never exposes the actual word
export async function GET() {
  return NextResponse.json({ date: getTodayString(), ready: true });
}
