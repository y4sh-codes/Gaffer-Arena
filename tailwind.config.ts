import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        muted: "var(--muted)",
        subtle: "var(--subtle)",
        arena: {
          dark: "#080c14",
          card: "rgba(16, 24, 39, 0.75)",
          cardHover: "rgba(26, 38, 62, 0.85)",
          border: "rgba(255, 255, 255, 0.08)",
          neonGreen: "#00ff87",
          neonCyan: "#00f0ff",
          gold: "#e6b800",
          pitch: "#143823",
          pitchLight: "#1a462c",
        },
      },
      boxShadow: {
        neon: "0 0 20px rgba(0, 255, 135, 0.35)",
        cyanGlow: "0 0 20px rgba(0, 240, 255, 0.35)",
        goldGlow: "0 0 25px rgba(230, 184, 0, 0.4)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
