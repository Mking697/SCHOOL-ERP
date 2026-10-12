import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "School ERP",
    short_name: "School ERP",
    description: "Self-hosted School Management ERP -- Admin, Staff, Student & Parent Portal",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#4f46e5",
    icons: [
      { src: "/icon", sizes: "192x192", type: "image/png" },
      { src: "/icon", sizes: "512x512", type: "image/png" },
    ],
  };
}
