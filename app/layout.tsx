import type { Metadata } from "next";
import { Sora, Epilogue, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

const epilogue = Epilogue({
  subsets: ["latin"],
  variable: "--font-epilogue",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fintechfestival.lk"),
  title: "LANKA FINTECHVERSE | Sri Lanka FinTech Festival 2026",
  description:
    "The Official Snakes & Ladders Game of the Sri Lanka FinTech Festival 2026. Test your FinTech knowledge, race against the AI, climb the leaderboard, and claim victory in the digital finance arena.",
  icons: {
    icon: "/short-logo-removebg-preview.png",
    shortcut: "/short-logo-removebg-preview.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "LANKA FINTECHVERSE — Sri Lanka FinTech Festival 2026",
    description: "Building Capacity. Creating Opportunities. Scaling Sri Lanka's Digital Future. Play the official festival game!",
    siteName: "Sri Lanka FinTech Festival 2026",
    images: ["/long-logo-removebg-preview.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${epilogue.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen bg-[#06061f] text-white selection:bg-[#fec01f] selection:text-black">
        {children}
      </body>
    </html>
  );
}
