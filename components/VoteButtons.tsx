"use client";

import { useState } from "react";

type CurrentUser =
  | {
      id: number;
      email: string;
      displayName: string;
      role: string;
    }
  | null;

export default function VoteButtons({
  targetType,
  targetId,
  initialScore,
  initialUpvotes,
  initialDownvotes,
  initialUserVote,
  currentUser,
  isOwnContent
}: {
  targetType: "post" | "reply";
  targetId: number;
  initialScore: number;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote: number;
  currentUser: CurrentUser;
  isOwnContent: boolean;
}) {
  const [score, setScore] = useState(initialScore);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitVote(nextValue: -1 | 1) {
    if (!currentUser) {
      setError("You must be logged in to vote.");
      return;
    }

    if (isOwnContent) {
      setError("You cannot vote on your own content.");
      return;
    }

    setError("");
    setLoading(true);

    const valueToSend = userVote === nextValue ? 0 : nextValue;

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          targetType,
          targetId,
          value: valueToSend
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unable to apply vote.");
        return;
      }

      setScore(data.score);
      setUpvotes(data.upvotes);
      setDownvotes(data.downvotes);
      setUserVote(data.currentUserVote);
    } catch {
      setError("Unable to apply vote.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: "0.75rem" }}>
      <div className="small-gap">
        <button
          type="button"
          disabled={loading}
          onClick={() => submitVote(1)}
          aria-pressed={userVote === 1}
        >
          👍 {userVote === 1 ? "Upvoted" : "Upvote"}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => submitVote(-1)}
          aria-pressed={userVote === -1}
        >
          👎 {userVote === -1 ? "Downvoted" : "Downvote"}
        </button>

        <span className="meta">
          Score: {score} · Up: {upvotes} · Down: {downvotes}
        </span>
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
}