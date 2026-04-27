"use client";

import { useEffect, useCallback, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { useGame } from "@/hooks/useGame";
import { useChallenge } from "@/hooks/useChallenge";
import { GameBoard } from "@/components/GameBoard/GameBoard";
import { Keyboard } from "@/components/Keyboard/Keyboard";
import { WinModal } from "@/components/Modals/WinModal";
import { LossModal } from "@/components/Modals/LossModal";
import { ChallengeModal } from "@/components/Modals/ChallengeModal";

export default function Home() {
  const { status, guesses, error, challenge: challengeState, setError } = useGameStore();
  const { onKey } = useGame();
  const { createChallenge } = useChallenge(null);

  const [showWin, setShowWin] = useState(false);
  const [showLoss, setShowLoss] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeSent, setChallengeSent] = useState(false);
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [challengeError, setChallengeError] = useState<string | null>(null);
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
    }, 1800);
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

  async function handleCreateChallenge(creatorEmail: string, opponentEmail: string) {
    setChallengeLoading(true);
    setChallengeError(null);
    const token = localStorage.getItem("wh_player_token") ?? "";
    const result = await createChallenge(creatorEmail, opponentEmail, token);
    setChallengeLoading(false);
    if (!result) {
      setChallengeError("Failed to send invite. Try again.");
    } else {
      setChallengeSent(true);
    }
  }

  return (
    <>
      <header className="header">
        <span className="header-title">WordHunt</span>
        <button
          className="btn btn-primary"
          style={{ padding: "8px 16px", fontSize: "0.8rem" }}
          onClick={() => { setShowChallenge(true); setChallengeSent(false); setChallengeError(null); }}
        >
          Challenge
        </button>
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
          onChallenge={() => { setShowWin(false); setShowChallenge(true); setChallengeSent(false); }}
        />
      )}

      {showLoss && (
        <LossModal
          answer=""
          onClose={() => setShowLoss(false)}
          onChallenge={() => { setShowLoss(false); setShowChallenge(true); setChallengeSent(false); }}
        />
      )}

      {showChallenge && (
        <ChallengeModal
          onClose={() => setShowChallenge(false)}
          onCreate={handleCreateChallenge}
          loading={challengeLoading}
          error={challengeError}
          sent={challengeSent}
        />
      )}
    </>
  );
}
