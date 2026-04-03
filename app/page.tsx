import { prisma } from "@/lib/db";
import Link from "next/link";
import ChannelForm from "@/components/ChannelForm";
import ChannelList from "@/components/ChannelList";
import { getCurrentUser } from "@/lib/session";

export default async function HomePage() {
  const [channels, currentUser] = await Promise.all([
    prisma.channel.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        creator: true,
        _count: {
          select: { posts: true }
        }
      }
    }),
    getCurrentUser()
  ]);

  return (
    <div className="stack">
      <section className="hero">
        <h1>Channel-Based Programming Q&amp;A Tool</h1>
        <p className="meta">
          Ask programming questions by channel, post solutions, reply to posts,
          and attach screenshots for debugging.
        </p>
        <div className="small-gap">
          <Link href="#channels">Browse channels</Link>
          <Link href="#create-channel">Create a channel</Link>
        </div>
      </section>

      <section className="grid">
        <div className="card" id="channels">
          <h2>Channels</h2>
          <p className="meta">
            Pick a channel to browse posts or start a new discussion.
          </p>
          <ChannelList channels={channels} />
        </div>

        <div className="form-card" id="create-channel">
          <h2>Create channel</h2>
          <ChannelForm currentUser={currentUser} />
        </div>
      </section>
    </div>
  );
}