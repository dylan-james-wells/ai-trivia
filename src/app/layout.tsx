import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Trivia - Jeopardy Style Game",
  description: "A multiplayer trivia game powered by AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white">
        {children}
      </body>
    </html>
  );
}
