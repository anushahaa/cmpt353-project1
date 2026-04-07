import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isAllowedUpload, saveFile } from "@/lib/upload";
import { replySchema, formatZodError } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get("postId");

  const replies = await prisma.reply.findMany({
    where: postId ? { postId: Number(postId) } : undefined,
    orderBy: { createdAt: "asc" },
    include: {
      author: true,
      attachments: true,
      votes: true
    }
  });

  return NextResponse.json(replies);
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Access denied. Please log in to reply." },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const rawParentReplyId = formData.get("parentReplyId");

    const payload = {
      postId: formData.get("postId"),
      parentReplyId:
        rawParentReplyId === "" || rawParentReplyId === null
          ? undefined
          : rawParentReplyId,
      body: formData.get("body")
    };

    const parsed = replySchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const normalizedParentReplyId =
      parsed.data.parentReplyId === "" ||
      parsed.data.parentReplyId === null ||
      parsed.data.parentReplyId === undefined
        ? null
        : Number(parsed.data.parentReplyId);

    if (normalizedParentReplyId !== null) {
      const parentReply = await prisma.reply.findUnique({
        where: { id: normalizedParentReplyId }
      });

      if (!parentReply) {
        return NextResponse.json(
          { error: "Parent reply not found." },
          { status: 404 }
        );
      }

      if (parentReply.postId !== parsed.data.postId) {
        return NextResponse.json(
          { error: "Parent reply must belong to the same post." },
          { status: 400 }
        );
      }
    }

    const attachment = formData.get("attachment");

    const reply = await prisma.reply.create({
      data: {
        postId: parsed.data.postId,
        body: parsed.data.body,
        authorId: currentUser.id,
        parentReplyId: normalizedParentReplyId
      }
    });

    if (attachment && attachment instanceof File && attachment.size > 0) {
      const uploadError = isAllowedUpload(
        attachment.type,
        attachment.name,
        attachment.size
      );

      if (uploadError) {
        await prisma.reply.delete({ where: { id: reply.id } });
        return NextResponse.json({ error: uploadError }, { status: 400 });
      }

      const saved = await saveFile(attachment);

      await prisma.attachment.create({
        data: {
          targetType: "reply",
          targetId: reply.id,
          mimeType: saved.mimeType,
          sizeBytes: saved.sizeBytes,
          path: saved.relativePath,
          replyId: reply.id
        }
      });
    }

    return NextResponse.json(reply, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to create reply." },
      { status: 500 }
    );
  }
}