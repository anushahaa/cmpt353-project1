"use client";

import { useState } from "react";

type User = {
  id: number;
  displayName: string;
};

export default function ChannelForm({ users }: { users: User[] }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [createdBy, setCreatedBy] = useState(users[0]?.id?.toString() ?? "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
          description,
          createdBy
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

  return (
    <form onSubmit={handleSubmit}>
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

      <div style={{ marginTop: "0.8rem" }}>
        <label htmlFor="channel-user">Creator</label>
        <select
          id="channel-user"
          value={createdBy}
          onChange={(e) => setCreatedBy(e.target.value)}
          required
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.displayName}
            </option>
          ))}
        </select>
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