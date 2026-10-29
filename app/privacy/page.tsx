import type { Metadata } from "next";
import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy | Sri Lanka FinTechverse — Sri Lanka FinTech Festival 2026",
  description:
    "Official Privacy Policy for Sri Lanka FinTechverse, the digital arena of the Sri Lanka FinTech Festival 2026. Learn how we handle Google OAuth, PDPA compliance, voluntary leaderboard privacy, and data security.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy — Sri Lanka FinTechverse | Sri Lanka FinTech Festival 2026",
    description:
      "Privacy policy and data governance details for Sri Lanka FinTechverse. Compliant with Sri Lanka PDPA No. 9 of 2022 and Google API Services User Data Policies.",
    url: "https://verse.fintechfestival.lk/privacy",
    siteName: "Sri Lanka FinTech Festival 2026",
    images: ["/long-logo-removebg-preview.png"],
  },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
