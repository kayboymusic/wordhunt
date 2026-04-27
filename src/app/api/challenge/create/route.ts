import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { sendChallengeInvite } from "@/lib/email/sendInvite";
import { generateToken } from "@/lib/utils/generateToken";
import { getTodayString } from "@/lib/utils/getDailyWord";

const schema = z.object({
  creatorEmail: z.string().email(),
  opponentEmail: z.string().email(),
  playerToken: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { creatorEmail, opponentEmail, playerToken } = parsed.data;

  if (creatorEmail.toLowerCase() === opponentEmail.toLowerCase()) {
    return NextResponse.json({ error: "Cannot challenge yourself" }, { status: 400 });
  }

  const gameDate = getTodayString();
  const db = createServerClient();

  // Check creator hasn't already played today
  const { data: existingSession } = await db
    .from("game_sessions")
    .select("id, status")
    .eq("player_token", playerToken)
    .eq("game_date", gameDate)
    .single();

  if (existingSession && existingSession.status !== "playing") {
    return NextResponse.json({ error: "You have already played today" }, { status: 409 });
  }

  const inviteToken = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { data: challenge, error } = await db
    .from("challenges")
    .insert({
      invite_token: inviteToken,
      creator_email: creatorEmail,
      opponent_email: opponentEmail,
      status: "pending",
      game_date: gameDate,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 });
  }

  // Fire-and-forget — don't block the response on email delivery
  sendChallengeInvite({
    to: opponentEmail,
    fromEmail: creatorEmail,
    challengeId: challenge.id,
    inviteToken,
  }).catch((err) => console.error("Email send failed:", err));

  return NextResponse.json({ challenge });
}
