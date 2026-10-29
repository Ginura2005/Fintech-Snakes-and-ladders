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

const SITE_URL = "https://verse.fintechfestival.lk";
const SITE_NAME = "Sri Lanka FinTechverse";
const SITE_NAME_YEAR = "Sri Lanka FinTech Festival 2026";
const DEFAULT_TITLE = `${SITE_NAME} | Official Game of ${SITE_NAME_YEAR}`;
const DEFAULT_DESCRIPTION =
  "Play the official Snakes & Ladders game of Sri Lanka FinTech Festival 2026. Race across 25 squares, answer FinTech quizzes, solve daily logic puzzles, and climb the live festival leaderboard.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#06061f" },
    { media: "(prefers-color-scheme: light)", color: "#06061f" },
  ],
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Sri Lanka FinTechverse",
    "Lanka FinTechverse",
    "Sri Lanka FinTech Festival 2026",
    "FinTech Festival Sri Lanka",
    "Snakes and Ladders",
    "FinTech quiz",
    "festival leaderboard",
    "Colombo FinTech",
    "LankaPay",
    "digital finance Sri Lanka",
    "fintechfestival.lk",
  ],
  authors: [{ name: "Sri Lanka FinTech Festival", url: "https://fintechfestival.lk" }],
  creator: "Sri Lanka FinTech Festival",
  publisher: "Sri Lanka FinTech Festival",
  category: "games",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: "/short-logo-removebg-preview.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/short-logo-removebg-preview.png",
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_LK",
    url: SITE_URL,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    siteName: SITE_NAME_YEAR,
    images: [
      {
        url: "/share-card-clean.png",
        width: 1200,
        height: 630,
        alt: "Sri Lanka FinTechverse — Sri Lanka FinTech Festival 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/share-card-clean.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "theme-color": "#06061f",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-LK"
      className={`${sora.variable} ${epilogue.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen bg-background text-white antialiased selection:bg-primary selection:text-black">
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
