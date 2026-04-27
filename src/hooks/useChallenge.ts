"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChallengeStatus } from "@/types";

interface ChallengeData {
  id: string;
  status: ChallengeStatus;
  creatorEmail: string;
  opponentEmail: string;
  expiresAt: string;
}

export function useChallenge(challengeId: string | null) {
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchChallenge = useCallback(async (id: string) => {
    const res = await fetch(`/api/challenge/${id}`);
    if (!res.ok) return;
    const { challenge: data } = await res.json();
    setChallenge({
      id: data.id,
      status: data.status,
      creatorEmail: data.creator_email,
      opponentEmail: data.opponent_email,
      expiresAt: data.expires_at,
    });
    return data.status as ChallengeStatus;
  }, []);

  // Poll while challenge is pending
  useEffect(() => {
    if (!challengeId) return;
    fetchChallenge(challengeId);

    function schedulePoll() {
      pollRef.current = setTimeout(async () => {
        const status = await fetchChallenge(challengeId!);
        if (status === "pending") schedulePoll();
      }, 5000);
    }

    schedulePoll();

    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [challengeId, fetchChallenge]);

  const createChallenge = useCallback(
    async (creatorEmail: string, opponentEmail: string, playerToken: string) => {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/challenge/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorEmail, opponentEmail, playerToken }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error ?? "Failed to create challenge");
        return null;
      }
      return data.challenge;
    },
    []
  );

  const acceptChallenge = useCallback(
    async (
      id: string,
      inviteToken: string,
      playerToken: string,
      opponentEmail: string
    ) => {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/challenge/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: id, inviteToken, playerToken, opponentEmail }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error ?? "Failed to accept challenge");
        return false;
      }
      setChallenge((prev) => prev ? { ...prev, status: "in_progress" } : prev);
      return true;
    },
    []
  );

  const cancelChallenge = useCallback(async (id: string, playerToken: string) => {
    setLoading(true);
    const res = await fetch("/api/challenge/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId: id, playerToken }),
    });
    setLoading(false);
    if (res.ok) {
      setChallenge((prev) => prev ? { ...prev, status: "cancelled" } : prev);
    }
  }, []);

  return { challenge, loading, error, createChallenge, acceptChallenge, cancelChallenge };
}
