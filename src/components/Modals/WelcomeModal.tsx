"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface WelcomeModalProps {
  onGuest: () => void;
}

export function WelcomeModal({ onGuest }: WelcomeModalProps) {
  const [busy, setBusy] = useState(false);

  const signInWithGoogle = async () => {
    setBusy(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal welcome-modal"
        role="dialog"
        aria-labelledby="welcome-title"
      >
        <h2 id="welcome-title" className="modal-title">Welcome to WordHunt</h2>
        <p className="modal-body">
          Guess the daily 5-letter word. Sign in to sync your stats across
          devices, or jump right in as a guest.
        </p>

        <div className="welcome-actions">
          <button
            className="btn btn-google"
            onClick={signInWithGoogle}
            disabled={busy}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.6 5.6 29 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.6 5.6 29 4 24 4 16.3 4 9.6 8.4 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c4.9 0 9.4-1.9 12.7-5l-5.9-5c-1.9 1.3-4.3 2-6.8 2-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l5.9 5c-.4.4 6.5-4.7 6.5-14.7 0-1.3-.1-2.4-.4-3.5z"
              />
            </svg>
            Continue with Google
          </button>
          <button
            className="btn btn-secondary"
            onClick={onGuest}
            disabled={busy}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
