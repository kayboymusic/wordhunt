"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { useGameStore } from "@/store/gameStore";
import { useGame } from "@/hooks/useGame";
import { GameBoard } from "@/components/GameBoard/GameBoard";
import { Keyboard } from "@/components/Keyboard/Keyboard";
import { WinModal } from "@/components/Modals/WinModal";
import { LossModal } from "@/components/Modals/LossModal";
import { ShareModal } from "@/components/Modals/ShareModal";
import { HowToPlayModal } from "@/components/Modals/HowToPlayModal";
import { WelcomeModal } from "@/components/Modals/WelcomeModal";
import { ColorPicker } from "@/components/ColorPicker/ColorPicker";
import { AuthButton } from "@/components/AuthButton/AuthButton";
import { supabase } from "@/lib/supabase/client";
import { getDailyWord } from "@/lib/utils/getDailyWord";

const CONFETTI_COLORS = [
  "#538d4e", "#5B40DE", "#FF047D", "#DA5B1D", "#0067E0", "#b59f3b", "#ffffff",
];

function fireWinConfetti() {
  const base = {
    ticks: 180,
    gravity: 0.9,
    decay: 0.93,
    startVelocity: 40,
    colors: CONFETTI_COLORS,
  };
  confetti({ ...base, particleCount: 110, spread: 100, origin: { x: 0.5, y: 0.6 } });
  setTimeout(
    () => confetti({ ...base, particleCount: 55, spread: 70, angle: 60,  origin: { x: 0.1, y: 0.7 } }),
    180,
  );
  setTimeout(
    () => confetti({ ...base, particleCount: 55, spread: 70, angle: 120, origin: { x: 0.9, y: 0.7 } }),
    360,
  );
}

export default function Home() {
  const { status, guesses, error, challenge: challengeState, setError, sessionId, isLoading } = useGameStore();
  const { onKey } = useGame();

  const [showWin, setShowWin] = useState(false);
  const [showLoss, setShowLoss] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const welcomeDecided = useRef(false);
  useEffect(() => {
    if (welcomeDecided.current) return;
    if (sessionId === null || isLoading) return;
    welcomeDecided.current = true;
    if (guesses.length > 0) return;
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      if (!data.user) setShowWelcome(true);
    });
    return () => { cancelled = true; };
  }, [sessionId, isLoading, guesses.length]);

  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
  }, []);

  useEffect(() => {
    if (status === "won") {
      const confettiT = setTimeout(fireWinConfetti, 1100);
      const modalT = setTimeout(() => setShowWin(true), 1800);
      return () => { clearTimeout(confettiT); clearTimeout(modalT); };
    }
    if (status === "lost") {
      const t = setTimeout(() => setShowLoss(true), 1600);
      return () => clearTimeout(t);
    }
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
          <button
            className="header-icon-btn"
            onClick={() => setShowHowTo(true)}
            aria-label="How to play"
            title="How to play"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
          <ColorPicker />
          <button
            className="btn btn-primary share-btn"
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
            <span className="share-btn-label">Share</span>
          </button>
          <AuthButton />
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

      {showHowTo && <HowToPlayModal onClose={() => setShowHowTo(false)} />}

      {showWelcome && <WelcomeModal onGuest={dismissWelcome} />}
    </>
  );
}
