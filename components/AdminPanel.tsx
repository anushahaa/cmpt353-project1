"use client";

import { useState } from "react";

type UserRow = {
  id: number;
  email: string;
  displayName: string;
  role: string;
};

type ChannelRow = {
  id: number;
  name: string;
};

type PostRow = {
  id: number;
  title: string;
};

type ReplyRow = {
  id: number;
  body: string;
};

export default function AdminPanel({
  users,
  channels,
  posts,
  replies
}: {
  users: UserRow[];
  channels: ChannelRow[];
  posts: PostRow[];
  replies: ReplyRow[];
}) {
  const [error, setError] = useState("");

  async function destroy(url: string, label: string) {
    const confirmed = window.confirm(`Are you sure you want to delete this ${label}?`);
    if (!confirmed) return;

    setError("");

    const res = await fetch(url, {
      method: "DELETE"
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || `Failed to delete ${label}.`);
      return;
    }

    window.location.reload();
  }

  return (
    <div className="stack">
      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>Users</h2>
        <div className="stack">
          {users.map((user) => (
            <div key={user.id} className="reply-card">
              <p>
                <strong>{user.displayName}</strong> — {user.email} ({user.role})
              </p>
              <button
                type="button"
                onClick={() => destroy(`/api/admin/users/${user.id}`, "user")}
              >
                Delete user
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Channels</h2>
        <div className="stack">
          {channels.map((channel) => (
            <div key={channel.id} className="reply-card">
              <p>
                <strong>#{channel.name}</strong>
              </p>
              <button
                type="button"
                onClick={() =>
                  destroy(`/api/admin/channels/${channel.id}`, "channel")
                }
              >
                Delete channel
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Posts</h2>
        <div className="stack">
          {posts.map((post) => (
            <div key={post.id} className="reply-card">
              <p>{post.title}</p>
              <button
                type="button"
                onClick={() => destroy(`/api/admin/posts/${post.id}`, "post")}
              >
                Delete post
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Replies</h2>
        <div className="stack">
          {replies.map((reply) => (
            <div key={reply.id} className="reply-card">
              <p>{reply.body}</p>
              <button
                type="button"
                onClick={() => destroy(`/api/admin/replies/${reply.id}`, "reply")}
              >
                Delete reply
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}