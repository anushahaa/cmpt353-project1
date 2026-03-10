import { prisma } from "@/lib/db";
import path from "path";
import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: {
    id: string;
  };
};

export async function GET(_req: NextRequest, { params }: Props) {
  const id = Number(params.id);

  if (Number.isNaN(id)) {
    return new NextResponse("Invalid attachment id.", { status: 400 });
  }

  const attachment = await prisma.attachment.findUnique({
    where: { id }
  });

  if (!attachment) {
    return new NextResponse("Attachment not found.", { status: 404 });
  }

  const fullPath = path.join(process.cwd(), attachment.path);

  try {
    const file = await fs.readFile(fullPath);

    return new NextResponse(file, {
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Length": String(attachment.sizeBytes),
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return new NextResponse("Stored file not found.", { status: 404 });
  }
}