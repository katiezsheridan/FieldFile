import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // FieldFile brand colors (from Brand Book v1.0)
        field: {
          black: "#1A1A1A",      // Forest Black - primary text, headers
          green: "#2D5016",      // Field Green - primary brand, CTAs
          brown: "#5C4033",      // Earth Brown - secondary accents, borders
          blue: "#4A90E2",       // Sky Blue - links, info
          grey: "#E8E8E8",       // Limestone Grey - backgrounds, dividers
          cream: "#F5F1E8",      // Warm Cream - page backgrounds, cards
          red: "#D64545",        // Alert Red - warnings, urgent
          ink: "#1a1a1a",        // Forest Ink - primary text
          forest: "#2d5016",     // Deep Forest - CTAs, interactive elements
          wheat: "#d8d1c9",      // Wheat - borders, dividers, subtle fills
        },
        // Status colors
        status: {
          draft: "#6B7280",
          ready: "#3B82F6",
          filed: "#F59E0B",
          accepted: "#10B981",
          followup: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
