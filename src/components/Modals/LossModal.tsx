"use client";

interface LossModalProps {
  answer: string;
  onClose: () => void;
  onChallenge: () => void;
}

export function LossModal({ answer, onClose, onChallenge }: LossModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title text-red-400">Better luck tomorrow</h2>
        <p className="modal-body">
          The word was <strong className="text-white uppercase">{answer}</strong>.
        </p>
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
