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
        bg:      '#F5F0E8',
        black:   '#0A0A0A',
        white:   '#FFFFFF',
        green:   '#00FF88',
        orange:  '#FF4500',
        blue:    '#0066FF',
      },
      fontFamily: {
        mono: ['"Space Mono"', '"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
