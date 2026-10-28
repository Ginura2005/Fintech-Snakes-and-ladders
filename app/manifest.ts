import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lanka FinTechverse — Sri Lanka FinTech Festival 2026",
    short_name: "FinTechverse",
    description:
      "The Official Digital Finance & Logic Arena of the Sri Lanka FinTech Festival 2026.",
    start_url: "/",
    display: "standalone",
    background_color: "#06061f",
    theme_color: "#06061f",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/short-logo-removebg-preview.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
