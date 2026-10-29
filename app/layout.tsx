import type { Metadata, Viewport } from "next";
import { Sora, Epilogue, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import CustomCursor from "@/components/ui/CustomCursor";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#06061f",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://verse.fintechfestival.lk"),
  title: {
    default: "LANKA FINTECHVERSE | Sri Lanka FinTech Festival 2026",
    template: "%s | Lanka FinTechverse",
  },
  description:
    "The Official Snakes & Ladders Game and Logic Arena of the Sri Lanka FinTech Festival 2026. Test your FinTech knowledge, race against autonomous AI, climb the live festival leaderboard, and solve daily puzzles.",
  applicationName: "Lanka FinTechverse",
  keywords: [
    "FinTech",
    "Sri Lanka FinTech Festival 2026",
    "Lanka FinTechverse",
    "LankaPay",
    "Central Bank of Sri Lanka",
    "Digital Banking",
    "Financial Technology",
    "Colombo FinTech",
    "Gamification",
    "Snakes and Ladders",
  ],
  authors: [{ name: "Sri Lanka FinTech Festival" }],
  creator: "Sri Lanka FinTech Festival",
  publisher: "Sri Lanka FinTech Festival",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://verse.fintechfestival.lk",
  },
  icons: {
    icon: [
      { url: "/short-logo-removebg-preview.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/short-logo-removebg-preview.png",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://verse.fintechfestival.lk",
    title: "LANKA FINTECHVERSE — Sri Lanka FinTech Festival 2026",
    description:
      "Building Capacity. Creating Opportunities. Scaling Sri Lanka's Digital Future. Race against AI in the official festival arena!",
    siteName: "Sri Lanka FinTech Festival 2026",
    images: [
      {
        url: "/long-logo-removebg-preview.png",
        width: 1200,
        height: 630,
        alt: "Sri Lanka FinTech Festival 2026 Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LANKA FINTECHVERSE | Sri Lanka FinTech Festival 2026",
    description:
      "Test your FinTech intelligence, race against autonomous AI, and climb the official tournament leaderboard at the Sri Lanka FinTech Festival 2026.",
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
        <CustomCursor />
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
