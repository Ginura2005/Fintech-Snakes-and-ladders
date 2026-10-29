import type { Metadata } from "next";
import TermsContent from "./TermsContent";

export const metadata: Metadata = {
  title: "Terms of Service | Sri Lanka FinTechverse — Sri Lanka FinTech Festival 2026",
  description:
    "Official Application Terms of Service for Sri Lanka FinTechverse. Review the rules of play, non-gambling declaration, 1-run official attempt policy, fair play guidelines, and tournament standards.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service — Sri Lanka FinTechverse | Sri Lanka FinTech Festival 2026",
    description:
      "Official Application Terms of Service for Sri Lanka FinTechverse. Read fair play rules, non-gambling declarations, and tournament conditions.",
    url: "https://verse.fintechfestival.lk/terms",
    siteName: "Sri Lanka FinTech Festival 2026",
    images: ["/long-logo-removebg-preview.png"],
  },
};

export default function TermsPage() {
  return <TermsContent />;
}
