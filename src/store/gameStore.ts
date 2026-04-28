"use client";

import { create } from "zustand";
import { EvaluatedGuess, GameStatus, ChallengeState, KeyState, LetterState } from "@/types";

interface GameStore {
  sessionId: string | null;
  guesses: EvaluatedGuess[];
  currentGuess: string;
  status: GameStatus;
  challenge: ChallengeState | null;
  keyStates: KeyState;
  error: string | null;
  isLoading: boolean;
  shakeKey: number;

  setSessionId: (id: string) => void;
  addGuess: (guess: EvaluatedGuess) => void;
  setCurrentGuess: (guess: string) => void;
  setStatus: (status: GameStatus) => void;
  setChallenge: (challenge: ChallengeState | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  triggerShake: () => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  guesses: [],
  currentGuess: "",
  status: "playing" as GameStatus,
  challenge: null,
  keyStates: {},
  error: null,
  isLoading: false,
  shakeKey: 0,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setSessionId: (id) => set({ sessionId: id }),

  addGuess: (guess) =>
    set((state) => {
      const newKeyStates = { ...state.keyStates };
      const priority: Record<LetterState, number> = {
        correct: 3,
        present: 2,
        absent: 1,
        typing: 0,
        empty: 0,
      };
      for (const { letter, state: letterState } of guess.result) {
        const k = letter.toUpperCase();
        const current = newKeyStates[k];
        if (!current || priority[letterState] > priority[current]) {
          newKeyStates[k] = letterState;
        }
      }
      return { guesses: [...state.guesses, guess], keyStates: newKeyStates };
    }),

  setCurrentGuess: (guess) => set({ currentGuess: guess }),
  setStatus: (status) => set({ status }),
  setChallenge: (challenge) => set({ challenge }),
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
  triggerShake: () => set((s) => ({ shakeKey: s.shakeKey + 1 })),
  reset: () => set(initialState),
}));
