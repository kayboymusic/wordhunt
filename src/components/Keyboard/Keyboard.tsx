"use client";

import { useGameStore } from "@/store/gameStore";
import { LetterState } from "@/types";

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
];

const stateClasses: Record<LetterState, string> = {
  correct: "key-correct",
  present: "key-present",
  absent: "key-absent",
  empty: "key-default",
  typing: "key-default",
};

interface KeyboardProps {
  onKey: (key: string) => void;
}

export function Keyboard({ onKey }: KeyboardProps) {
  const { keyStates, status } = useGameStore();

  return (
    <div className="keyboard" role="group" aria-label="Letter input keyboard">
      {ROWS.map((row, i) => (
        <div key={i} className="keyboard-row">
          {row.map((key) => {
            const letterState = keyStates[key];
            const cls = letterState ? stateClasses[letterState] : "key-default";
            const isWide = key === "ENTER" || key === "BACKSPACE";
            return (
              <button
                key={key}
                className={`key ${cls} ${isWide ? "key-wide" : ""}`}
                onClick={() => onKey(key)}
                disabled={status !== "playing"}
                aria-label={key}
              >
                {key === "BACKSPACE" ? "⌫" : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
