import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LANKA FINTECHVERSE — Sri Lanka FinTech Festival 2026",
  description:
    "Play LANKA FINTECHVERSE — the official Snakes & Ladders game of the Sri Lanka FinTech Festival 2026. Test your FinTech knowledge, climb the leaderboard, and challenge your friends!",
  openGraph: {
    title: "LANKA FINTECHVERSE",
    description: "Play the game. Climb the leaderboard. Challenge your friends.",
    siteName: "Sri Lanka FinTech Festival 2026",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
