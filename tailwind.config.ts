import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#EA580C",
        monetary: "#7E22CE",
        success: "#16A34A",
        warning: "#CA8A04",
        danger: "#DC2626",
        info: "#2563EB",
        background: "#0F172A",
        surface: "#1E293B",
        "text-primary": "#F8FAFC",
        "text-secondary": "#94A3B8"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
