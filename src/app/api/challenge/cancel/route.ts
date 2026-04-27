import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";

const schema = z.object({
  challengeId: z.string().uuid(),
  playerToken: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { challengeId, playerToken } = parsed.data;
  const db = createServerClient();

  const { data: challenge } = await db
    .from("challenges")
    .select("*")
    .eq("id", challengeId)
    .single();

  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  // Verify the caller is related to this challenge via a session
  const { data: session } = await db
    .from("game_sessions")
    .select("id")
    .eq("player_token", playerToken)
    .eq("challenge_id", challengeId)
    .single();

  // Allow cancel if caller has a session or is the creator (matched by email-less token)
  const isChallengeCreatorSession =
    session ||
    challenge.creator_session_id === null; // creator hasn't started yet

  if (!isChallengeCreatorSession && !session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  if (!["pending", "accepted", "in_progress"].includes(challenge.status)) {
    return NextResponse.json({ error: "Cannot cancel a finished challenge" }, { status: 409 });
  }

  await db.from("challenges").update({ status: "cancelled" }).eq("id", challengeId);

  return NextResponse.json({ success: true });
}
