"use client";

import { useCallback, useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { EvaluatedGuess } from "@/types";
import { evaluateGuess } from "@/lib/utils/evaluateGuess";
import { getDailyWord, getTodayString } from "@/lib/utils/getDailyWord";
import { VALID_WORDS } from "@/lib/words/validGuesses";
import { ANSWERS } from "@/lib/words/answers";

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;
const ALL_VALID = new Set([...VALID_WORDS, ...ANSWERS]);
const LOCAL_KEY = "wh_local_session";

function getOrCreatePlayerToken(): string {
  const stored = localStorage.getItem("wh_player_token");
  if (stored) return stored;
  const token = crypto.randomUUID();
  localStorage.setItem("wh_player_token", token);
  return token;
}

function loadLocal(today: string) {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.game_date === today ? parsed : null;
  } catch {
    return null;
  }
}

function saveLocal(game_date: string, guesses: string[], status: string) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify({ game_date, guesses, status }));
}

export function useGame(challengeId?: string) {
  const store = useGameStore();
  const localMode = useRef(false);

  useEffect(() => {
    const token = getOrCreatePlayerToken();
    initSession(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function initSession(token: string) {
    store.setLoading(true);
    store.setError(null);

    try {
      // Try to restore or create a server-backed session
      const stateRes = await fetch(`/api/game/state?playerToken=${token}`);
      if (stateRes.ok) {
        const { session } = await stateRes.json();
        if (session) {
          store.setSessionId(session.id);
          for (const eg of session.evaluatedGuesses as EvaluatedGuess[]) {
            store.addGuess(eg);
          }
          store.setStatus(session.status);
          store.setLoading(false);
          return;
        }
      }

      const startRes = await fetch("/api/game/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerToken: token, challengeId }),
      });

      if (startRes.ok) {
        const { session } = await startRes.json();
        store.setSessionId(session.id);
        store.setLoading(false);
        return;
      }
    } catch {
      // Fall through to local mode
    }

    // Local mode: game runs entirely client-side
    localMode.current = true;
    const today = getTodayString();
    const saved = loadLocal(today);
    if (saved) {
      const answer = getDailyWord();
      for (const word of saved.guesses as string[]) {
        store.addGuess({ word, result: evaluateGuess(word, answer) });
      }
      store.setStatus(saved.status);
    }
    store.setSessionId("local");
    store.setLoading(false);
  }

  const submitGuess = useCallback(async () => {
    const { sessionId, currentGuess, guesses, status } = useGameStore.getState();
    if (
      !sessionId ||
      status !== "playing" ||
      currentGuess.length !== WORD_LENGTH ||
      guesses.length >= MAX_GUESSES
    ) return;

    const word = currentGuess.toLowerCase();

    if (!ALL_VALID.has(word)) {
      store.setError("Not in word list");
      return;
    }

    // Local-mode evaluation (no Supabase required)
    if (localMode.current || sessionId === "local") {
      const answer = getDailyWord();
      const result = evaluateGuess(word, answer);
      const isWon = result.every((r) => r.state === "correct");
      const newGuesses = [...guesses, { word, result }];
      const isLost = !isWon && newGuesses.length >= MAX_GUESSES;
      const newStatus = isWon ? "won" : isLost ? "lost" : "playing";

      store.addGuess({ word, result });
      store.setCurrentGuess("");
      store.setStatus(newStatus);
      saveLocal(getTodayString(), newGuesses.map((g) => g.word), newStatus);
      return;
    }

    // Server-backed evaluation
    store.setLoading(true);
    store.setError(null);
    try {
      const token = getOrCreatePlayerToken();
      const res = await fetch("/api/game/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, playerToken: token, guess: word }),
      });

      const data = await res.json();
      store.setLoading(false);

      if (!res.ok) {
        store.setError(data.error ?? "Invalid guess");
        return;
      }

      store.addGuess({ word, result: data.result });
      store.setCurrentGuess("");
      store.setStatus(data.status);
    } catch {
      store.setLoading(false);
      store.setError("Connection error");
    }
  }, [store]);

  const onKey = useCallback(
    (key: string) => {
      const { currentGuess, status, guesses } = useGameStore.getState();
      if (status !== "playing") return;

      if (key === "ENTER") {
        submitGuess();
        return;
      }
      if (key === "BACKSPACE") {
        store.setCurrentGuess(currentGuess.slice(0, -1));
        return;
      }
      if (
        /^[A-Za-z]$/.test(key) &&
        currentGuess.length < WORD_LENGTH &&
        guesses.length < MAX_GUESSES
      ) {
        store.setCurrentGuess(currentGuess + key.toUpperCase());
      }
    },
    [store, submitGuess]
  );

  return { onKey };
}
