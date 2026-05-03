import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Yu Gothic UI",
          "Meiryo",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 38px rgba(125, 92, 255, 0.25)",
        panel: "0 24px 80px rgba(0, 0, 0, 0.34)",
      },
    },
  },
  plugins: [],
};

export default config;
