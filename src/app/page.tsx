"use client";

import { useEffect, useCallback, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { useGame } from "@/hooks/useGame";
import { GameBoard } from "@/components/GameBoard/GameBoard";
import { Keyboard } from "@/components/Keyboard/Keyboard";
import { WinModal } from "@/components/Modals/WinModal";
import { LossModal } from "@/components/Modals/LossModal";
import { ShareModal } from "@/components/Modals/ShareModal";
import { ColorPicker } from "@/components/ColorPicker/ColorPicker";
import { getDailyWord } from "@/lib/utils/getDailyWord";

export default function Home() {
  const { status, guesses, error, challenge: challengeState, setError } = useGameStore();
  const { onKey } = useGame();

  const [showWin, setShowWin] = useState(false);
  const [showLoss, setShowLoss] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (status === "won") setTimeout(() => setShowWin(true), 1600);
    if (status === "lost") setTimeout(() => setShowLoss(true), 1600);
  }, [status]);

  useEffect(() => {
    if (!error) return;
    setToast(error);
    const t = setTimeout(() => {
      setToast(null);
      setError(null);
    }, 2000);
    return () => clearTimeout(t);
  }, [error, setError]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) return;
      if (e.key === "Enter") onKey("ENTER");
      else if (e.key === "Backspace") onKey("BACKSPACE");
      else if (/^[a-zA-Z]$/.test(e.key)) onKey(e.key.toUpperCase());
    },
    [onKey]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <header className="header">
        <span className="header-title">WordHunt</span>
        <div className="header-actions">
          <ColorPicker />
          <button
            className="btn btn-primary"
            style={{ padding: "8px 16px", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 6 }}
            onClick={() => setShowShare(true)}
            aria-label="Share"
          >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
            Share
          </button>
        </div>
      </header>

      {challengeState && (
        <div className="challenge-banner">
          <span>
            vs <strong>{challengeState.opponentEmail}</strong> — challenge{" "}
            <strong>{challengeState.status}</strong>
          </span>
        </div>
      )}

      <main style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0", flex: 1 }}>
        <GameBoard />
        <Keyboard onKey={onKey} />
      </main>

      {toast && <div className="toast">{toast}</div>}

      {showWin && (
        <WinModal
          guessCount={guesses.length}
          onClose={() => setShowWin(false)}
          onChallenge={() => { setShowWin(false); setShowShare(true); }}
        />
      )}

      {showLoss && (
        <LossModal
          answer={getDailyWord()}
          onClose={() => setShowLoss(false)}
          onChallenge={() => { setShowLoss(false); setShowShare(true); }}
        />
      )}

      {showShare && <ShareModal onClose={() => setShowShare(false)} />}
    </>
  );
}
