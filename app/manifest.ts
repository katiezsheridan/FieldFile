import type { MetadataRoute } from "next";

// PWA manifest (served at /manifest.webmanifest). Makes FieldFile installable so
// landowners can launch it like an app from the home screen and capture in the
// field. Colors use the field-* palette (forest theme, cream background).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FieldFile",
    short_name: "FieldFile",
    description:
      "Document wildlife & ag (1-d-1) tax-valuation compliance from the field.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F7F5EE",
    theme_color: "#495336",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
