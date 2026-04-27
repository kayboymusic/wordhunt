import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = createServerClient();

  const { data: challenge } = await db
    .from("challenges")
    .select("id, status, creator_email, opponent_email, game_date, expires_at")
    .eq("id", id)
    .single();

  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  // Auto-expire stale pending challenges
  if (
    challenge.status === "pending" &&
    new Date(challenge.expires_at) < new Date()
  ) {
    await db.from("challenges").update({ status: "expired" }).eq("id", id);
    return NextResponse.json({ challenge: { ...challenge, status: "expired" } });
  }

  return NextResponse.json({ challenge });
}
