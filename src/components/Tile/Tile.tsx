"use client";

import { useState, useEffect, useRef } from "react";
import { LetterState } from "@/types";

interface TileProps {
  letter?: string;
  state: LetterState;
  delay?: number;
}

const backClass: Partial<Record<LetterState, string>> = {
  correct: "tile-correct",
  present: "tile-present",
  absent:  "tile-absent",
};

function isResult(s: LetterState) {
  return s === "correct" || s === "present" || s === "absent";
}

export function Tile({ letter, state, delay = 0 }: TileProps) {
  const result = isResult(state);

  // Start flipped if tile is already a result on first mount (page restore)
  const [flipped, setFlipped] = useState(() => result);
  const prevStateRef = useRef<LetterState>(state);

  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = state;

    // Only animate when transitioning INTO a result state (new guess submitted)
    if (result && !isResult(prev)) {
      const t = setTimeout(() => setFlipped(true), delay);
      return () => clearTimeout(t);
    }

    // If state resets (e.g. game reset), un-flip
    if (!result && flipped) {
      setFlipped(false);
    }
  }, [state, result, delay, flipped]);

  const frontClass = state === "typing" ? "tile-typing" : "tile-empty";

  return (
    <div className="tile-wrapper">
      <div className={`tile${flipped && result ? " tile-flip" : ""}`}>
        <div className={`tile-face tile-front ${frontClass}`}>
          {letter ?? ""}
        </div>
        <div className={`tile-face tile-back ${backClass[state] ?? ""}`}>
          {letter ?? ""}
        </div>
      </div>
    </div>
  );
}
