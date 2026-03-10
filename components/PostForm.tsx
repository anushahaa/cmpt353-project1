"use client";

import { useState } from "react";

type User = {
  id: number;
  displayName: string;
};

export default function PostForm({
  channelId,
  users
}: {
  channelId: number;
  users: User[];
}) {
  const [authorId, setAuthorId] = useState(users[0]?.id?.toString() ?? "");
  const [title, setTitle] = useState("");
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
      formData.append("channelId", String(channelId));
      formData.append("authorId", authorId);
      formData.append("title", title);
      formData.append("body", body);

      if (file) {
        formData.append("attachment", file);
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create post.");
        return;
      }

      setSuccess("Post created successfully.");
      setTitle("");
      setBody("");
      setFile(null);
      window.location.reload();
    } catch {
      setError("Something went wrong while creating the post.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="post-author">Author</label>
        <select
          id="post-author"
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
        <label htmlFor="post-title">Title</label>
        <input
          id="post-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your question a clear title"
          required
        />
      </div>

      <div style={{ marginTop: "0.8rem" }}>
        <label htmlFor="post-body">Body</label>
        <textarea
          id="post-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Describe the problem, error, or question"
          required
        />
      </div>

      <div style={{ marginTop: "0.8rem" }}>
        <label htmlFor="post-attachment">Screenshot (optional)</label>
        <input
          id="post-attachment"
          type="file"
          accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Create post"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </form>
  );
}