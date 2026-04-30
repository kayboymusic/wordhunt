"use client";

import { Tile } from "@/components/Tile/Tile";
import type { LetterState } from "@/types";

interface HowToPlayModalProps {
  onClose: () => void;
}

interface ExampleRowProps {
  word: string;
  highlightIndex: number;
  highlightState: Extract<LetterState, "correct" | "present" | "absent">;
}

function ExampleRow({ word, highlightIndex, highlightState }: ExampleRowProps) {
  return (
    <div className="howto-row" aria-hidden="true">
      {Array.from(word).map((letter, i) => (
        <Tile
          key={i}
          letter={letter}
          state={i === highlightIndex ? highlightState : "empty"}
        />
      ))}
    </div>
  );
}

export function HowToPlayModal({ onClose }: HowToPlayModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal howto-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="howto-title"
      >
        <h2 id="howto-title" className="modal-title">How to Play</h2>
        <p className="modal-body">Guess the 5-letter word in 6 tries.</p>
        <p className="modal-body text-sm text-gray-400">
          After each guess, the tiles change color to show how close you were.
        </p>

        <div className="howto-examples">
          <div className="howto-example">
            <ExampleRow word="WEARY" highlightIndex={0} highlightState="correct" />
            <p className="howto-text">
              <strong>W</strong> is in the word and in the correct spot.
            </p>
          </div>

          <div className="howto-example">
            <ExampleRow word="PILLS" highlightIndex={1} highlightState="present" />
            <p className="howto-text">
              <strong>I</strong> is in the word but in the wrong spot.
            </p>
          </div>

          <div className="howto-example">
            <ExampleRow word="VAGUE" highlightIndex={3} highlightState="absent" />
            <p className="howto-text">
              <strong>U</strong> is not in the word in any spot.
            </p>
          </div>
        </div>

        <p className="modal-body text-sm text-gray-400" style={{ marginTop: 18 }}>
          A new word is available each day. Pick your favorite tile color from the
          palette in the header.
        </p>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  );
}
