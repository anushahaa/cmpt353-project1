import { prisma } from "@/lib/db";
import { isAllowedUpload, saveFile } from "@/lib/upload";
import { postSchema, formatZodError } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const channelId = req.nextUrl.searchParams.get("channelId");

  const posts = await prisma.post.findMany({
    where: channelId ? { channelId: Number(channelId) } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      author: true,
      attachments: true,
      replies: {
        include: {
          author: true,
          attachments: true
        },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const payload = {
      channelId: formData.get("channelId"),
      authorId: formData.get("authorId"),
      title: formData.get("title"),
      body: formData.get("body")
    };

    const parsed = postSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const attachment = formData.get("attachment");

    const post = await prisma.post.create({
      data: parsed.data
    });

    if (attachment && attachment instanceof File && attachment.size > 0) {
      const uploadError = isAllowedUpload(
        attachment.type,
        attachment.name,
        attachment.size
      );

      if (uploadError) {
        await prisma.post.delete({ where: { id: post.id } });
        return NextResponse.json({ error: uploadError }, { status: 400 });
      }

      const saved = await saveFile(attachment);

      await prisma.attachment.create({
        data: {
          targetType: "post",
          targetId: post.id,
          mimeType: saved.mimeType,
          sizeBytes: saved.sizeBytes,
          path: saved.relativePath,
          postId: post.id
        }
      });
    }

    return NextResponse.json(post, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to create post." },
      { status: 500 }
    );
  }
}