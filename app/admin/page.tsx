import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import AdminPanel from "@/components/AdminPanel";

export default async function AdminPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <section className="form-card" style={{ maxWidth: 700, margin: "2rem auto" }}>
        <h1>Access denied</h1>
        <p>You must be logged in to view the admin page.</p>
        <div className="small-gap">
          <Link href="/login">Login</Link>
          <Link href="/signup">Sign up</Link>
        </div>
      </section>
    );
  }

  if (currentUser.role !== "admin") {
    return (
      <section className="form-card" style={{ maxWidth: 700, margin: "2rem auto" }}>
        <h1>Access denied</h1>
        <p>Only admin users can access this page.</p>
      </section>
    );
  }

  const [users, channels, posts, replies] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true
      }
    }),
    prisma.channel.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true
      }
    }),
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true
      }
    }),
    prisma.reply.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        body: true
      }
    })
  ]);

  return (
    <div className="stack">
      <section className="hero">
        <h1>Admin panel</h1>
        <p className="meta">
          Moderate users, channels, posts, and replies.
        </p>
      </section>

      <AdminPanel
        users={users}
        channels={channels}
        posts={posts}
        replies={replies}
      />
    </div>
  );
}