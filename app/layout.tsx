import "./globals.css";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "Channel-Based Programming Q&A Tool",
  description: "Part 1 project implementation"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container nav">
            <Link href="/" className="brand">
              DevDiscuss
            </Link>
            <nav>
              <Link href="/">Home</Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}