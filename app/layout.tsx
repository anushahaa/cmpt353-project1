import "./globals.css";
import Link from "next/link";
import React from "react";
import { getCurrentUser } from "@/lib/session";
import AuthStatus from "@/components/AuthStatus";

export const metadata = {
  title: "Channel-Based Programming Q&A Tool",
  description: "Part 1 + Part 2 project implementation"
};

export default async function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container nav">
            <Link href="/" className="brand">
              DevDiscuss
            </Link>
            <nav className="small-gap">
              <Link href="/">Home</Link>
              {currentUser?.role === "admin" && <Link href="/admin">Admin</Link>}
            </nav>
            <AuthStatus currentUser={currentUser} />
          </div>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}