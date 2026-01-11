import type { Metadata } from "next";
import "./globals.css";
import { SparkleBackground } from "@/components/SparkleBackground";

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
      <body className="min-h-screen text-white">
        <SparkleBackground />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
