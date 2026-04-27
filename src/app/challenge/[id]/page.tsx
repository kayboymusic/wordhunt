"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { useGame } from "@/hooks/useGame";
import { useChallenge } from "@/hooks/useChallenge";
import { GameBoard } from "@/components/GameBoard/GameBoard";
import { Keyboard } from "@/components/Keyboard/Keyboard";
import { WinModal } from "@/components/Modals/WinModal";
import { LossModal } from "@/components/Modals/LossModal";
import { ChallengeStatus } from "@/types";

export default function ChallengePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const challengeId = params.id as string;
  const inviteToken = searchParams.get("token");

  const { status, guesses, error } = useGameStore();
  const { onKey } = useGame(challengeId);
  const { challenge, loading, acceptChallenge, cancelChallenge } = useChallenge(challengeId);

  const [opponentEmail, setOpponentEmail] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showWin, setShowWin] = useState(false);
  const [showLoss, setShowLoss] = useState(false);

  useEffect(() => {
    if (status === "won") setTimeout(() => setShowWin(true), 1600);
    if (status === "lost") setTimeout(() => setShowLoss(true), 1600);
  }, [status]);

  useEffect(() => {
    if (error) {
      setToast(error);
      const t = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) return;
      if (challenge?.status !== "in_progress" && challenge?.status !== "accepted") return;
      if (e.key === "Enter") onKey("ENTER");
      else if (e.key === "Backspace") onKey("BACKSPACE");
      else if (/^[a-zA-Z]$/.test(e.key)) onKey(e.key.toUpperCase());
    },
    [onKey, challenge?.status]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  async function handleAccept() {
    if (!inviteToken || !opponentEmail.trim()) return;
    setAccepting(true);
    const token = localStorage.getItem("wh_player_token") ?? crypto.randomUUID();
    localStorage.setItem("wh_player_token", token);
    const ok = await acceptChallenge(challengeId, inviteToken, token, opponentEmail.trim());
    setAccepting(false);
    if (!ok) setAcceptError("Failed to accept. The invite may be expired.");
  }

  async function handleCancel() {
    const token = localStorage.getItem("wh_player_token") ?? "";
    await cancelChallenge(challengeId, token);
  }

  const challengeStatus: ChallengeStatus | undefined = challenge?.status;
  const isInvitee = !!inviteToken;
  const gameUnlocked = challengeStatus === "in_progress" || challengeStatus === "accepted";

  if (loading && !challenge) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100dvh" }}>
        <p style={{ color: "#888" }}>Loading challenge…</p>
      </div>
    );
  }

  if (challengeStatus === "cancelled") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100dvh", gap: 16 }}>
        <p style={{ color: "#f87171", fontWeight: 700, fontSize: "1.25rem" }}>Challenge cancelled</p>
        <a href="/" className="btn btn-secondary">Play solo today</a>
      </div>
    );
  }

  if (challengeStatus === "expired") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100dvh", gap: 16 }}>
        <p style={{ color: "#f87171", fontWeight: 700, fontSize: "1.25rem" }}>Invite expired</p>
        <a href="/" className="btn btn-secondary">Play solo today</a>
      </div>
    );
  }

  return (
    <>
      <header className="header">
        <span className="header-title">WordHunt</span>
        {challengeStatus && (
          <span style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase" }}>
            {challengeStatus}
          </span>
        )}
      </header>

      {challenge && (
        <div className="challenge-banner">
          <span>
            <strong>{challenge.creatorEmail}</strong> vs <strong>{challenge.opponentEmail}</strong>
          </span>
          {!gameUnlocked && (
            <button
              onClick={handleCancel}
              style={{ fontSize: "0.75rem", color: "#f87171", background: "none", border: "none", cursor: "pointer" }}
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Accept panel — shown to invitee when challenge is pending */}
      {isInvitee && challengeStatus === "pending" && (
        <div style={{ maxWidth: 400, width: "100%", margin: "24px auto", padding: "0 16px" }}>
          <div className="modal" style={{ position: "static", transform: "none" }}>
            <h2 className="modal-title">Accept Challenge</h2>
            <p className="modal-body">
              <strong>{challenge?.creatorEmail}</strong> challenged you to today&apos;s WordHunt.
            </p>
            <input
              type="email"
              placeholder="Your email"
              value={opponentEmail}
              onChange={(e) => setOpponentEmail(e.target.value)}
              className="input"
              style={{ marginTop: 12 }}
            />
            {acceptError && <p style={{ color: "#f87171", fontSize: "0.875rem", marginTop: 8 }}>{acceptError}</p>}
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleAccept} disabled={accepting || !opponentEmail.trim()}>
                {accepting ? "Accepting…" : "Accept"}
              </button>
              <a href="/" className="btn btn-secondary">Play solo</a>
            </div>
          </div>
        </div>
      )}

      {/* Waiting screen — creator sees this until opponent accepts */}
      {!isInvitee && challengeStatus === "pending" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 16, padding: 24 }}>
          <p style={{ color: "#94a3b8", fontSize: "1rem" }}>
            Waiting for <strong style={{ color: "#fff" }}>{challenge?.opponentEmail}</strong> to accept…
          </p>
          <p style={{ color: "#555", fontSize: "0.875rem" }}>This page refreshes automatically.</p>
          <button className="btn btn-secondary" onClick={handleCancel}>Cancel &amp; play solo</button>
        </div>
      )}

      {/* Game — unlocked after accept */}
      {gameUnlocked && (
        <main style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0", flex: 1 }}>
          <GameBoard />
          <Keyboard onKey={onKey} />
        </main>
      )}

      {toast && <div className="toast">{toast}</div>}

      {showWin && (
        <WinModal
          guessCount={guesses.length}
          onClose={() => setShowWin(false)}
          onChallenge={() => {}}
        />
      )}

      {showLoss && (
        <LossModal
          answer=""
          onClose={() => setShowLoss(false)}
          onChallenge={() => {}}
        />
      )}
    </>
  );
}
