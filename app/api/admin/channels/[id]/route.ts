import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";

type Props = {
  params: {
    id: string;
  };
};

export async function DELETE(_req: Request, { params }: Props) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { error: "Access denied. Please log in." },
      { status: 401 }
    );
  }

  if (currentUser.role !== "admin") {
    return NextResponse.json(
      { error: "Access denied. Admin only." },
      { status: 403 }
    );
  }

  const id = Number(params.id);

  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid channel id." }, { status: 400 });
  }

  try {
    await prisma.channel.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Channel deleted." });
  } catch {
    return NextResponse.json(
      { error: "Unable to delete channel." },
      { status: 500 }
    );
  }
}