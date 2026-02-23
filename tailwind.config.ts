import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "loc-bg": "#0d1420",
        "loc-card": "#161f2e",
        "loc-card-light": "#1c2737",
        "loc-accent": "#3b9eff",
        "loc-muted": "#6b7a8d",
        "loc-border": "#1e2d3d",
        "loc-live": "#ef4444",
        "loc-green": "#22c55e",
      },
    },
  },
  plugins: [],
};
export default config;
