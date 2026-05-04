"use client";

import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAvatarBroken(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const signIn = async () => {
    setBusy(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const signOut = async () => {
    setBusy(true);
    await supabase.auth.signOut();
    setOpen(false);
    setBusy(false);
  };

  if (!user) {
    return (
      <button
        className="header-icon-btn"
        onClick={signIn}
        disabled={busy}
        aria-label="Sign in"
        title="Playing as guest — click to sign in"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>
    );
  }

  const initial =
    (user.user_metadata?.full_name as string | undefined)?.[0] ??
    user.email?.[0]?.toUpperCase() ??
    "?";
  const avatar =
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined);

  return (
    <div className="auth-popover-wrap" ref={popoverRef}>
      <button
        className="header-icon-btn auth-avatar-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account"
        title={user.email ?? "Account"}
      >
        {avatar && !avatarBroken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt=""
            className="auth-avatar"
            referrerPolicy="no-referrer"
            onError={() => setAvatarBroken(true)}
          />
        ) : (
          <span className="auth-avatar auth-avatar-fallback">{initial}</span>
        )}
      </button>
      {open && (
        <div className="auth-popover" role="menu">
          <div className="auth-popover-email">{user.email}</div>
          <button
            className="auth-popover-item"
            onClick={signOut}
            disabled={busy}
            role="menuitem"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
