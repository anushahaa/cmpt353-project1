import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { displayName: "asc" }
  });

  return NextResponse.json(users);
}