import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getDailyWord } from "@/lib/utils/getDailyWord";
import { evaluateGuess } from "@/lib/utils/evaluateGuess";
import { getTodayString } from "@/lib/utils/getDailyWord";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const playerToken = searchParams.get("playerToken");

  if (!playerToken) {
    return NextResponse.json({ error: "Missing playerToken" }, { status: 400 });
  }

  const gameDate = getTodayString();
  const db = createServerClient();

  const { data: session } = await db
    .from("game_sessions")
    .select("*")
    .eq("player_token", playerToken)
    .eq("game_date", gameDate)
    .single();

  if (!session) {
    return NextResponse.json({ session: null });
  }

  // Reconstruct evaluated guesses without exposing the answer
  const answer = getDailyWord(new Date(session.game_date));
  const evaluatedGuesses = session.guesses.map((word: string) => ({
    word,
    result: evaluateGuess(word, answer),
  }));

  return NextResponse.json({ session: { ...session, evaluatedGuesses } });
}
