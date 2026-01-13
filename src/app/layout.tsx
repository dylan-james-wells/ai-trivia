import type { Metadata } from "next";
import { Play } from "next/font/google";
import "./globals.css";
import { SparkleBackground } from "@/components/SparkleBackground";

const play = Play({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "TrivAI - AI-based Trivia Game",
  description: "A multiplayer trivia game powered by AI",
  // themeColor: "#174392",
  themeColor: "red"
  // appleWebApp: {
  //   statusBarStyle: "black-translucent",
  // },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full min-h-[100dvh]">
      <body className={`min-h-[100dvh] text-white bg-[#1a1a2e] ${play.className}`}>
        <SparkleBackground />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
