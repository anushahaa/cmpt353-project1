import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { formatZodError, voteSchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

function calculateSummary(votes: { value: number; userId: number }[], currentUserId?: number) {
  const upvotes = votes.filter((vote) => vote.value === 1).length;
  const downvotes = votes.filter((vote) => vote.value === -1).length;
  const score = votes.reduce((sum, vote) => sum + vote.value, 0);
  const currentUserVote =
    votes.find((vote) => vote.userId === currentUserId)?.value ?? 0;

  return {
    upvotes,
    downvotes,
    score,
    currentUserVote
  };
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Access denied. Please log in to vote." },
        { status: 401 }
      );
    }

    const json = await req.json();
    const parsed = voteSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { targetType, targetId, value } = parsed.data;

    if (targetType === "post") {
      const post = await prisma.post.findUnique({
        where: { id: targetId },
        include: { author: true }
      });

      if (!post) {
        return NextResponse.json({ error: "Post not found." }, { status: 404 });
      }

      if (post.authorId === currentUser.id) {
        return NextResponse.json(
          { error: "You cannot vote on your own post." },
          { status: 400 }
        );
      }

      const existing = await prisma.vote.findUnique({
        where: {
          userId_targetType_targetId: {
            userId: currentUser.id,
            targetType,
            targetId
          }
        }
      });

      if (value === 0) {
        if (existing) {
          await prisma.vote.delete({
            where: {
              userId_targetType_targetId: {
                userId: currentUser.id,
                targetType,
                targetId
              }
            }
          });
        }
      } else if (existing) {
        await prisma.vote.update({
          where: {
            userId_targetType_targetId: {
              userId: currentUser.id,
              targetType,
              targetId
            }
          },
          data: { value }
        });
      } else {
        await prisma.vote.create({
          data: {
            userId: currentUser.id,
            targetType,
            targetId,
            value,
            postId: targetId
          }
        });
      }

      const votes = await prisma.vote.findMany({
        where: {
          targetType: "post",
          targetId
        },
        select: {
          value: true,
          userId: true
        }
      });

      return NextResponse.json(calculateSummary(votes, currentUser.id));
    }

    const reply = await prisma.reply.findUnique({
      where: { id: targetId },
      include: { author: true }
    });

    if (!reply) {
      return NextResponse.json({ error: "Reply not found." }, { status: 404 });
    }

    if (reply.authorId === currentUser.id) {
      return NextResponse.json(
        { error: "You cannot vote on your own reply." },
        { status: 400 }
      );
    }

    const existing = await prisma.vote.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: currentUser.id,
          targetType,
          targetId
        }
      }
    });

    if (value === 0) {
      if (existing) {
        await prisma.vote.delete({
          where: {
            userId_targetType_targetId: {
              userId: currentUser.id,
              targetType,
              targetId
            }
          }
        });
      }
    } else if (existing) {
      await prisma.vote.update({
        where: {
          userId_targetType_targetId: {
            userId: currentUser.id,
            targetType,
            targetId
          }
        },
        data: { value }
      });
    } else {
      await prisma.vote.create({
        data: {
          userId: currentUser.id,
          targetType,
          targetId,
          value,
          replyId: targetId
        }
      });
    }

    const votes = await prisma.vote.findMany({
      where: {
        targetType: "reply",
        targetId
      },
      select: {
        value: true,
        userId: true
      }
    });

    return NextResponse.json(calculateSummary(votes, currentUser.id));
  } catch {
    return NextResponse.json(
      { error: "Unable to apply vote." },
      { status: 500 }
    );
  }
}