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

export default function ChannelForm({ currentUser }: { currentUser: CurrentUser }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!currentUser) {
      setError("You must be logged in to create a channel.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          description
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create channel.");
        return;
      }

      setSuccess("Channel created successfully.");
      setName("");
      setDescription("");
      window.location.reload();
    } catch {
      setError("Something went wrong while creating the channel.");
    } finally {
      setLoading(false);
    }
  }

  if (!currentUser) {
    return (
      <div className="empty-state">
        <p>You must be logged in to create a channel.</p>
        <div className="small-gap">
          <Link href="/login">Login</Link>
          <Link href="/signup">Sign up</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="meta">Creating as {currentUser.displayName}</p>

      <div>
        <label htmlFor="channel-name">Channel name</label>
        <input
          id="channel-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. react"
          required
        />
      </div>

      <div style={{ marginTop: "0.8rem" }}>
        <label htmlFor="channel-description">Description</label>
        <textarea
          id="channel-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this channel for?"
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create channel"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </form>
  );
}