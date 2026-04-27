import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { getTodayString } from "@/lib/utils/getDailyWord";

const schema = z.object({
  playerToken: z.string().uuid(),
  challengeId: z.string().uuid().optional(),
  playerEmail: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { playerToken, challengeId, playerEmail } = parsed.data;
  const gameDate = getTodayString();
  const db = createServerClient();

  // Check if session already exists for today
  const { data: existing } = await db
    .from("game_sessions")
    .select("*")
    .eq("player_token", playerToken)
    .eq("game_date", gameDate)
    .single();

  if (existing) {
    return NextResponse.json({ session: existing });
  }

  // If challenge mode, verify challenge is accepted
  if (challengeId) {
    const { data: challenge } = await db
      .from("challenges")
      .select("*")
      .eq("id", challengeId)
      .single();

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }
    if (challenge.status === "pending") {
      return NextResponse.json({ error: "Challenge not yet accepted" }, { status: 403 });
    }
    if (challenge.status === "cancelled" || challenge.status === "expired") {
      return NextResponse.json({ error: "Challenge is no longer active" }, { status: 410 });
    }
  }

  const { data: session, error } = await db
    .from("game_sessions")
    .insert({
      player_token: playerToken,
      player_email: playerEmail ?? null,
      challenge_id: challengeId ?? null,
      game_date: gameDate,
      guesses: [],
      status: "playing",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }

  return NextResponse.json({ session });
}
