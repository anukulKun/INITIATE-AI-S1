import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          neon: "#39FF14",
          cyan: "#00D9FF",
          dark: "#0A0A0F"
        }
      }
    }
  },
  plugins: []
};

export default config;
