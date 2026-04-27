"use client";

interface WinModalProps {
  guessCount: number;
  onClose: () => void;
  onChallenge: () => void;
}

export function WinModal({ guessCount, onClose, onChallenge }: WinModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title text-green-400">You Won! 🎉</h2>
        <p className="modal-body">
          Solved in <strong>{guessCount}</strong> {guessCount === 1 ? "guess" : "guesses"}.
        </p>
        <p className="modal-body text-sm text-gray-400">Come back tomorrow for the next word.</p>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onChallenge}>
            Challenge a Friend
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
