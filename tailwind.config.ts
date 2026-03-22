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
        // FieldFile brand palette (v2 — from Color Palette Studio)
        field: {
          ink: "#322B2A",        // Dark Neutral - primary text, headings
          cream: "#F7F5EE",      // Light Neutral - page backgrounds
          wheat: "#D8D2C9",      // Light Neutral - borders, dividers
          mist: "#EEEFEC",       // Light Neutral - card/section backgrounds
          forest: "#495336",     // Accent - primary CTAs, nav active
          hero: "#5E7080",       // Hero - dashboard headers, icons
          terra: "#B64F2F",      // Accent - secondary CTAs, alerts, deadlines
          earth: "#6B5E51",      // Accent - subtle text, secondary labels
          gold: "#CAAC58",       // Accent - highlights, badges, progress
          // Legacy aliases (keep marketing pages working)
          black: "#322B2A",
          green: "#495336",
          brown: "#6B5E51",
          blue: "#5E7080",
          grey: "#EEEFEC",
          red: "#B64F2F",
          sage: "#495336",
        },
        // Status colors (aligned with palette)
        status: {
          draft: "#5E7080",      // hero slate
          ready: "#5E7080",      // hero slate
          filed: "#CAAC58",      // gold
          accepted: "#495336",   // forest
          followup: "#B64F2F",   // terra
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
