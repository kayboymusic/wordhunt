"use client";

import { useGameStore } from "@/store/gameStore";
import { Tile } from "@/components/Tile/Tile";
import { LetterState } from "@/types";

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

export function GameBoard() {
  const { guesses, currentGuess, status } = useGameStore();

  const rows = Array.from({ length: MAX_GUESSES }, (_, rowIdx) => {
    const submitted = guesses[rowIdx];
    const isCurrent = rowIdx === guesses.length && status === "playing";

    return Array.from({ length: WORD_LENGTH }, (_, colIdx) => {
      let letter = "";
      let state: LetterState = "empty";

      if (submitted) {
        letter = submitted.result[colIdx].letter.toUpperCase();
        state  = submitted.result[colIdx].state;
      } else if (isCurrent) {
        letter = currentGuess[colIdx] ?? "";
        state  = letter ? "typing" : "empty";
      }

      return { letter, state, colIdx };
    });
  });

  return (
    <div className="game-board" role="grid" aria-label="WordHunt game board">
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="game-row" role="row">
          {row.map(({ letter, state, colIdx }) => (
            <Tile
              key={colIdx}
              letter={letter}
              state={state}
              delay={colIdx * 120}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
