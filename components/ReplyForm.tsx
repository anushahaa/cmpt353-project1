"use client";

import Link from "next/link";
import { useState } from "react";

type CurrentUser =
  | {
      id: number;
      email: string;
      displayName: string;
      role: string;
    }
  | null;

export default function ReplyForm({
  postId,
  parentReplyId,
  currentUser,
  compact = false
}: {
  postId: number;
  parentReplyId?: number | null;
  currentUser: CurrentUser;
  compact?: boolean;
}) {
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!currentUser) {
      setError("You must be logged in to reply.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("postId", String(postId));
      formData.append("body", body);

      if (parentReplyId) {
        formData.append("parentReplyId", String(parentReplyId));
      }

      if (file) {
        formData.append("attachment", file);
      }

      const res = await fetch("/api/replies", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create reply.");
        return;
      }

      setSuccess("Reply added.");
      setBody("");
      setFile(null);
      window.location.reload();
    } catch {
      setError("Something went wrong while replying.");
    } finally {
      setLoading(false);
    }
  }

  if (!currentUser) {
    return (
      <div className="empty-state">
        <p>You must be logged in to reply.</p>
        <div className="small-gap">
          <Link href="/login">Login</Link>
          <Link href="/signup">Sign up</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="meta">
        {parentReplyId ? "Replying to a reply" : "Replying to a post"} as{" "}
        {currentUser.displayName}
      </p>

      <div style={{ marginTop: "0.8rem" }}>
        <label htmlFor={`reply-body-${postId}-${parentReplyId ?? "root"}`}>
          {parentReplyId ? "Nested reply" : "Reply"}
        </label>
        <textarea
          id={`reply-body-${postId}-${parentReplyId ?? "root"}`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={parentReplyId ? "Write a nested reply" : "Write your reply"}
          required
          style={compact ? { minHeight: "80px" } : undefined}
        />
      </div>

      <div style={{ marginTop: "0.8rem" }}>
        <label htmlFor={`reply-file-${postId}-${parentReplyId ?? "root"}`}>
          Screenshot (optional)
        </label>
        <input
          id={`reply-file-${postId}-${parentReplyId ?? "root"}`}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button type="submit" disabled={loading}>
          {loading ? "Replying..." : parentReplyId ? "Reply to reply" : "Reply to post"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </form>
  );
}