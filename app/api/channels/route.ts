import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { channelSchema, formatZodError } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const channels = await prisma.channel.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      creator: true,
      _count: {
        select: { posts: true }
      }
    }
  });

  return NextResponse.json(channels);
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Access denied. Please log in to create a channel." },
        { status: 401 }
      );
    }

    const json = await req.json();
    const parsed = channelSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const existing = await prisma.channel.findUnique({
      where: { name: parsed.data.name }
    });

    if (existing) {
      return NextResponse.json(
        { error: "Channel name already exists." },
        { status: 409 }
      );
    }

    const channel = await prisma.channel.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        createdBy: currentUser.id
      }
    });

    return NextResponse.json(channel, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to create channel." },
      { status: 500 }
    );
  }
}