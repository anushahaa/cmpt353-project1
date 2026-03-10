"use client";

import { useState } from "react";

type User = {
  id: number;
  displayName: string;
};

export default function ReplyForm({
  postId,
  users
}: {
  postId: number;
  users: User[];
}) {
  const [authorId, setAuthorId] = useState(users[0]?.id?.toString() ?? "");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("postId", String(postId));
      formData.append("authorId", authorId);
      formData.append("body", body);

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

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor={`reply-author-${postId}`}>Author</label>
        <select
          id={`reply-author-${postId}`}
          value={authorId}
          onChange={(e) => setAuthorId(e.target.value)}
          required
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.displayName}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: "0.8rem" }}>
        <label htmlFor={`reply-body-${postId}`}>Reply</label>
        <textarea
          id={`reply-body-${postId}`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your reply"
          required
        />
      </div>

      <div style={{ marginTop: "0.8rem" }}>
        <label htmlFor={`reply-file-${postId}`}>Screenshot (optional)</label>
        <input
          id={`reply-file-${postId}`}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button type="submit" disabled={loading}>
          {loading ? "Replying..." : "Reply to post"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </form>
  );
}