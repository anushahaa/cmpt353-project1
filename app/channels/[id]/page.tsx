import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import PostForm from "@/components/PostForm";
import PostCard from "@/components/PostCard";
import { getCurrentUser } from "@/lib/session";

type Props = {
  params: {
    id: string;
  };
};

function buildVoteSummary(
  votes: { value: number; userId: number }[],
  currentUserId?: number
) {
  const upvotes = votes.filter((vote) => vote.value === 1).length;
  const downvotes = votes.filter((vote) => vote.value === -1).length;
  const score = votes.reduce((sum, vote) => sum + vote.value, 0);
  const currentUserVote =
    votes.find((vote) => vote.userId === currentUserId)?.value ?? 0;

  return {
    score,
    upvotes,
    downvotes,
    currentUserVote
  };
}

function buildReplyTree(
  replies: Array<{
    id: number;
    postId: number;
    parentReplyId: number | null;
    body: string;
    createdAt: Date;
    authorId: number;
    author: {
      displayName: string;
    };
    attachments: {
      id: number;
      mimeType: string;
    }[];
    votes: {
      value: number;
      userId: number;
    }[];
  }>,
  currentUserId?: number
) {
  const byParent = new Map<number | null, any[]>();

  for (const reply of replies) {
    const parentKey = reply.parentReplyId ?? null;

    if (!byParent.has(parentKey)) {
      byParent.set(parentKey, []);
    }

    byParent.get(parentKey)!.push({
      id: reply.id,
      postId: reply.postId,
      parentReplyId: reply.parentReplyId,
      body: reply.body,
      createdAt: reply.createdAt,
      authorId: reply.authorId,
      author: reply.author,
      attachments: reply.attachments,
      voteSummary: buildVoteSummary(reply.votes, currentUserId),
      children: []
    });
  }

  function attachChildren(parentId: number | null) {
    const nodes = byParent.get(parentId) ?? [];

    return nodes.map((node) => ({
      ...node,
      children: attachChildren(node.id)
    }));
  }

  return attachChildren(null);
}

export default async function ChannelPage({ params }: Props) {
  const channelId = Number(params.id);

  if (Number.isNaN(channelId)) {
    notFound();
  }

  const [channel, rawPosts, currentUser] = await Promise.all([
    prisma.channel.findUnique({
      where: { id: channelId },
      include: { creator: true }
    }),
    prisma.post.findMany({
      where: { channelId },
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
        attachments: true,
        votes: {
          select: {
            value: true,
            userId: true
          }
        },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            author: true,
            attachments: true,
            votes: {
              select: {
                value: true,
                userId: true
              }
            }
          }
        }
      }
    }),
    getCurrentUser()
  ]);

  if (!channel) {
    notFound();
  }

  const posts = rawPosts.map((post) => ({
    id: post.id,
    title: post.title,
    body: post.body,
    createdAt: post.createdAt,
    authorId: post.authorId,
    author: post.author,
    attachments: post.attachments,
    voteSummary: buildVoteSummary(post.votes, currentUser?.id),
    replies: buildReplyTree(post.replies, currentUser?.id)
  }));

  return (
    <div className="stack">
      <section className="hero">
        <h1>#{channel.name}</h1>
        <p>{channel.description || "No description provided."}</p>
        <p className="meta">Created by {channel.creator.displayName}</p>
      </section>

      <section className="form-card">
        <h2>Create a post</h2>
        <PostForm channelId={channel.id} currentUser={currentUser} />
      </section>

      <section className="stack">
        <h2>Posts</h2>
        {posts.length === 0 ? (
          <div className="empty-state">
            No posts yet. Be the first to ask a question in this channel.
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={currentUser} />
          ))
        )}
      </section>
    </div>
  );
}