"use client";

import { useState } from "react";

interface ChallengeModalProps {
  onClose: () => void;
  onCreate: (creatorEmail: string, opponentEmail: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  sent: boolean;
}

export function ChallengeModal({
  onClose,
  onCreate,
  loading,
  error,
  sent,
}: ChallengeModalProps) {
  const [creatorEmail, setCreatorEmail] = useState("");
  const [opponentEmail, setOpponentEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onCreate(creatorEmail.trim(), opponentEmail.trim());
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Challenge a Friend</h2>

        {sent ? (
          <>
            <p className="modal-body text-green-400">
              Invite sent! Your game is locked until your friend accepts.
            </p>
            <p className="modal-body text-sm text-gray-400">
              You can cancel the challenge anytime to play solo.
            </p>
            <button className="btn btn-secondary mt-4" onClick={onClose}>
              Got it
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
            <input
              type="email"
              placeholder="Your email"
              value={creatorEmail}
              onChange={(e) => setCreatorEmail(e.target.value)}
              required
              className="input"
            />
            <input
              type="email"
              placeholder="Friend's email"
              value={opponentEmail}
              onChange={(e) => setOpponentEmail(e.target.value)}
              required
              className="input"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="modal-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Sending…" : "Send Invite"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
