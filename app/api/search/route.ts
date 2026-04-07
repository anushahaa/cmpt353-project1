import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type SearchMode =
  | "substring"
  | "author"
  | "most_posts"
  | "least_posts"
  | "highest_ranked"
  | "lowest_ranked";

function getPagination(req: NextRequest) {
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") || "1"));
  const pageSize = Math.max(
    1,
    Math.min(20, Number(req.nextUrl.searchParams.get("pageSize") || "5"))
  );

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize
  };
}

function scoreVotes(votes: { value: number }[]) {
  return votes.reduce((sum, vote) => sum + vote.value, 0);
}

export async function GET(req: NextRequest) {
  try {
    const mode = (req.nextUrl.searchParams.get("mode") || "substring") as SearchMode;
    const query = (req.nextUrl.searchParams.get("query") || "").trim();
    const author = (req.nextUrl.searchParams.get("author") || "").trim();
    const { page, pageSize, skip, take } = getPagination(req);

    if (
      ![
        "substring",
        "author",
        "most_posts",
        "least_posts",
        "highest_ranked",
        "lowest_ranked"
      ].includes(mode)
    ) {
      return NextResponse.json({ error: "Invalid search mode." }, { status: 400 });
    }

    if (mode === "substring") {
      if (!query) {
        return NextResponse.json(
          { error: "Search text is required for substring search." },
          { status: 400 }
        );
      }

      const [posts, replies] = await Promise.all([
        prisma.post.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { body: { contains: query, mode: "insensitive" } }
            ]
          },
          include: {
            author: true,
            channel: true,
            votes: { select: { value: true } }
          },
          orderBy: { createdAt: "desc" }
        }),
        prisma.reply.findMany({
          where: {
            body: { contains: query, mode: "insensitive" }
          },
          include: {
            author: true,
            post: {
              include: {
                channel: true
              }
            },
            votes: { select: { value: true } }
          },
          orderBy: { createdAt: "desc" }
        })
      ]);

      const combined = [
        ...posts.map((post) => ({
          type: "content" as const,
          targetType: "post" as const,
          id: post.id,
          title: post.title,
          body: post.body,
          authorDisplayName: post.author.displayName,
          channelName: post.channel.name,
          score: scoreVotes(post.votes),
          createdAt: post.createdAt,
          link: `/channels/${post.channelId}`
        })),
        ...replies.map((reply) => ({
          type: "content" as const,
          targetType: "reply" as const,
          id: reply.id,
          title: null,
          body: reply.body,
          authorDisplayName: reply.author.displayName,
          channelName: reply.post.channel.name,
          score: scoreVotes(reply.votes),
          createdAt: reply.createdAt,
          link: `/channels/${reply.post.channel.id}`
        }))
      ].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const paged = combined.slice(skip, skip + take);

      return NextResponse.json({
        mode,
        page,
        pageSize,
        hasMore: skip + take < combined.length,
        searchedFields: ["post.title", "post.body", "reply.body"],
        rankingFormula: "Newest content first for substring matches.",
        results: paged
      });
    }

    if (mode === "author") {
      if (!author) {
        return NextResponse.json(
          { error: "Author name is required for author search." },
          { status: 400 }
        );
      }

      const users = await prisma.user.findMany({
        where: {
          displayName: { contains: author, mode: "insensitive" }
        },
        select: {
          id: true
        }
      });

      const userIds = users.map((user) => user.id);

      const [posts, replies] = await Promise.all([
        prisma.post.findMany({
          where: {
            authorId: { in: userIds }
          },
          include: {
            author: true,
            channel: true,
            votes: { select: { value: true } }
          },
          orderBy: { createdAt: "desc" }
        }),
        prisma.reply.findMany({
          where: {
            authorId: { in: userIds }
          },
          include: {
            author: true,
            post: {
              include: {
                channel: true
              }
            },
            votes: { select: { value: true } }
          },
          orderBy: { createdAt: "desc" }
        })
      ]);

      const combined = [
        ...posts.map((post) => ({
          type: "content" as const,
          targetType: "post" as const,
          id: post.id,
          title: post.title,
          body: post.body,
          authorDisplayName: post.author.displayName,
          channelName: post.channel.name,
          score: scoreVotes(post.votes),
          createdAt: post.createdAt,
          link: `/channels/${post.channelId}`
        })),
        ...replies.map((reply) => ({
          type: "content" as const,
          targetType: "reply" as const,
          id: reply.id,
          title: null,
          body: reply.body,
          authorDisplayName: reply.author.displayName,
          channelName: reply.post.channel.name,
          score: scoreVotes(reply.votes),
          createdAt: reply.createdAt,
          link: `/channels/${reply.post.channel.id}`
        }))
      ].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const paged = combined.slice(skip, skip + take);

      return NextResponse.json({
        mode,
        page,
        pageSize,
        hasMore: skip + take < combined.length,
        searchedFields: ["user.displayName", "post.authorId", "reply.authorId"],
        rankingFormula: "Newest author content first.",
        results: paged
      });
    }

    if (mode === "most_posts" || mode === "least_posts") {
      const users = await prisma.user.findMany({
        include: {
          _count: {
            select: {
              posts: true
            }
          }
        }
      });

      const sorted = [...users].sort((a, b) =>
        mode === "most_posts"
          ? b._count.posts - a._count.posts
          : a._count.posts - b._count.posts
      );

      const paged = sorted.slice(skip, skip + take).map((user) => ({
        type: "user_summary" as const,
        displayName: user.displayName,
        email: user.email,
        count: user._count.posts
      }));

      return NextResponse.json({
        mode,
        page,
        pageSize,
        hasMore: skip + take < sorted.length,
        searchedFields: ["user.displayName", "post.authorId"],
        rankingFormula:
          mode === "most_posts"
            ? "Users sorted by post count descending."
            : "Users sorted by post count ascending.",
        results: paged
      });
    }

    if (mode === "highest_ranked" || mode === "lowest_ranked") {
      const [posts, replies] = await Promise.all([
        prisma.post.findMany({
          include: {
            author: true,
            channel: true,
            votes: { select: { value: true } }
          }
        }),
        prisma.reply.findMany({
          include: {
            author: true,
            post: {
              include: {
                channel: true
              }
            },
            votes: { select: { value: true } }
          }
        })
      ]);

      const combined = [
        ...posts.map((post) => ({
          type: "content" as const,
          targetType: "post" as const,
          id: post.id,
          title: post.title,
          body: post.body,
          authorDisplayName: post.author.displayName,
          channelName: post.channel.name,
          score: scoreVotes(post.votes),
          createdAt: post.createdAt,
          link: `/channels/${post.channelId}`
        })),
        ...replies.map((reply) => ({
          type: "content" as const,
          targetType: "reply" as const,
          id: reply.id,
          title: null,
          body: reply.body,
          authorDisplayName: reply.author.displayName,
          channelName: reply.post.channel.name,
          score: scoreVotes(reply.votes),
          createdAt: reply.createdAt,
          link: `/channels/${reply.post.channel.id}`
        }))
      ].sort((a, b) =>
        mode === "highest_ranked"
          ? b.score - a.score || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : a.score - b.score || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const paged = combined.slice(skip, skip + take);

      return NextResponse.json({
        mode,
        page,
        pageSize,
        hasMore: skip + take < combined.length,
        searchedFields: ["vote.value", "post", "reply"],
        rankingFormula:
          mode === "highest_ranked"
            ? "Net score descending, then newer content first."
            : "Net score ascending, then older content first.",
        results: paged
      });
    }

    return NextResponse.json({ error: "Unsupported search mode." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }
}