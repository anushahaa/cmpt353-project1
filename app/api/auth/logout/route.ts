import { clearSessionCookie } from "@/lib/session";
import { NextResponse } from "next/server";

function signOutResponse() {
  clearSessionCookie();
  return NextResponse.redirect(new URL("/", "http://localhost:3000"));
}

export async function GET() {
  return signOutResponse();
}

export async function POST() {
  clearSessionCookie();
  return NextResponse.json({ message: "Signed out." });
}