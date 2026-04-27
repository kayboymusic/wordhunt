import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { getTodayString } from "@/lib/utils/getDailyWord";

const schema = z.object({
  challengeId: z.string().uuid(),
  inviteToken: z.string(),
  playerToken: z.string().uuid(),
  opponentEmail: z.string().email(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { challengeId, inviteToken, playerToken, opponentEmail } = parsed.data;
  const db = createServerClient();

  const { data: challenge } = await db
    .from("challenges")
    .select("*")
    .eq("id", challengeId)
    .eq("invite_token", inviteToken)
    .single();

  if (!challenge) {
    return NextResponse.json({ error: "Invalid invite link" }, { status: 404 });
  }
  if (challenge.status !== "pending") {
    return NextResponse.json({ error: "Challenge already resolved" }, { status: 409 });
  }
  if (new Date(challenge.expires_at) < new Date()) {
    await db.from("challenges").update({ status: "expired" }).eq("id", challengeId);
    return NextResponse.json({ error: "Invite has expired" }, { status: 410 });
  }

  const gameDate = getTodayString();

  // Create opponent session (locked in challenge)
  const { data: opponentSession, error: sessionError } = await db
    .from("game_sessions")
    .upsert(
      {
        player_token: playerToken,
        player_email: opponentEmail,
        challenge_id: challengeId,
        game_date: gameDate,
        guesses: [],
        status: "playing",
      },
      { onConflict: "player_token,game_date" }
    )
    .select()
    .single();

  if (sessionError || !opponentSession) {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }

  const { error: updateError } = await db
    .from("challenges")
    .update({
      status: "in_progress",
      opponent_session_id: opponentSession.id,
    })
    .eq("id", challengeId);

  if (updateError) {
    return NextResponse.json({ error: "Failed to accept challenge" }, { status: 500 });
  }

  return NextResponse.json({ challenge: { ...challenge, status: "in_progress" } });
}
