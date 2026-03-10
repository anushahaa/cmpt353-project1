import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import PostForm from "@/components/PostForm";
import PostCard from "@/components/PostCard";

type Props = {
  params: {
    id: string;
  };
};

export default async function ChannelPage({ params }: Props) {
  const channelId = Number(params.id);

  if (Number.isNaN(channelId)) {
    notFound();
  }

  const [channel, users, posts] = await Promise.all([
    prisma.channel.findUnique({
      where: { id: channelId },
      include: { creator: true }
    }),
    prisma.user.findMany({
      orderBy: { displayName: "asc" }
    }),
    prisma.post.findMany({
      where: { channelId },
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
        attachments: true,
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            author: true,
            attachments: true
          }
        }
      }
    })
  ]);

  if (!channel) {
    notFound();
  }

  return (
    <div className="stack">
      <section className="hero">
        <h1>#{channel.name}</h1>
        <p>{channel.description || "No description provided."}</p>
        <p className="meta">
          Created by {channel.creator.displayName}
        </p>
      </section>

      <section className="form-card">
        <h2>Create a post</h2>
        <PostForm channelId={channel.id} users={users} />
      </section>

      <section className="stack">
        <h2>Posts</h2>
        {posts.length === 0 ? (
          <div className="empty-state">
            No posts yet. Be the first to ask a question in this channel.
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} users={users} />)
        )}
      </section>
    </div>
  );
}