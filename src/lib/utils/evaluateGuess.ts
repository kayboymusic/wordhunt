import { GuessResult, LetterState } from "@/types";

export function evaluateGuess(guess: string, answer: string): GuessResult[] {
  const result: GuessResult[] = Array.from({ length: 5 }, (_, i) => ({
    letter: guess[i],
    state: "absent" as LetterState,
  }));

  const answerLetterCount: Record<string, number> = {};
  for (const ch of answer) {
    answerLetterCount[ch] = (answerLetterCount[ch] ?? 0) + 1;
  }

  // First pass: mark correct positions
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) {
      result[i].state = "correct";
      answerLetterCount[guess[i]]--;
    }
  }

  // Second pass: mark present (wrong position) without exceeding letter frequency
  for (let i = 0; i < 5; i++) {
    if (result[i].state === "correct") continue;
    const ch = guess[i];
    if (answerLetterCount[ch] && answerLetterCount[ch] > 0) {
      result[i].state = "present";
      answerLetterCount[ch]--;
    }
  }

  return result;
}
