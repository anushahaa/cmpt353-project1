"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CurrentUser = {
  id: number;
  email: string;
  displayName: string;
  role: string;
} | null;

export default function AuthStatus() {
  const [user, setUser] = useState<CurrentUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    const res = await fetch("/api/auth/logout", {
      method: "POST"
    });

    if (res.ok) {
      window.location.href = "/";
    }
  }

  if (loading) {
    return <span className="meta">Loading...</span>;
  }

  if (!user) {
    return (
      <div className="small-gap">
        <Link href="/login">Login</Link>
        <Link href="/signup">Sign up</Link>
      </div>
    );
  }

  return (
    <div className="small-gap">
      <span className="meta">
        Signed in as {user.displayName}
        {user.role === "admin" ? " (admin)" : ""}
      </span>
      <button type="button" onClick={handleLogout}>
        Sign out
      </button>
    </div>
  );
}