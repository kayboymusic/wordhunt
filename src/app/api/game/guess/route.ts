import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { getDailyWord } from "@/lib/utils/getDailyWord";
import { evaluateGuess } from "@/lib/utils/evaluateGuess";
import { VALID_WORDS } from "@/lib/words/validGuesses";
import { ANSWERS } from "@/lib/words/answers";

const ALL_VALID = new Set([...VALID_WORDS, ...ANSWERS]);
const MAX_GUESSES = 6;

const schema = z.object({
  sessionId: z.string().uuid(),
  playerToken: z.string().uuid(),
  guess: z.string().length(5).toLowerCase(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { sessionId, playerToken, guess } = parsed.data;
  const db = createServerClient();

  const { data: session } = await db
    .from("game_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("player_token", playerToken)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (session.status !== "playing") {
    return NextResponse.json({ error: "Game already finished" }, { status: 409 });
  }
  if (session.guesses.length >= MAX_GUESSES) {
    return NextResponse.json({ error: "No guesses remaining" }, { status: 409 });
  }
  if (!ALL_VALID.has(guess)) {
    return NextResponse.json({ error: "Not a valid word" }, { status: 422 });
  }

  const answer = getDailyWord(new Date(session.game_date));
  const result = evaluateGuess(guess, answer);
  const newGuesses = [...session.guesses, guess];

  const isWon = result.every((r) => r.state === "correct");
  const isLost = !isWon && newGuesses.length >= MAX_GUESSES;
  const newStatus = isWon ? "won" : isLost ? "lost" : "playing";

  await db
    .from("game_sessions")
    .update({
      guesses: newGuesses,
      status: newStatus,
      completed_at: newStatus !== "playing" ? new Date().toISOString() : null,
    })
    .eq("id", sessionId);

  // If challenge game is complete, check if both players are done
  if (session.challenge_id && newStatus !== "playing") {
    await maybeCompleteChallenge(db, session.challenge_id);
  }

  return NextResponse.json({ result, status: newStatus, guessCount: newGuesses.length });
}

async function maybeCompleteChallenge(
  db: ReturnType<typeof createServerClient>,
  challengeId: string
) {
  const { data: challenge } = await db
    .from("challenges")
    .select("creator_session_id, opponent_session_id")
    .eq("id", challengeId)
    .single();

  if (!challenge?.creator_session_id || !challenge?.opponent_session_id) return;

  const { data: sessions } = await db
    .from("game_sessions")
    .select("status")
    .in("id", [challenge.creator_session_id, challenge.opponent_session_id]);

  const allDone = sessions?.every((s) => s.status !== "playing");
  if (allDone) {
    await db
      .from("challenges")
      .update({ status: "completed" })
      .eq("id", challengeId);
  }
}
