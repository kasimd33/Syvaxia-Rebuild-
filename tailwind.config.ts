import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * Syvaxia Design System
 * ---------------------
 * Primary:   Deep Navy / Slate   — authority, enterprise credibility
 * Accent:    Electric Indigo    — CTAs, interactive states (brand-derived)
 * Status:    Emerald            — cohort open / verified badges
 * Surfaces:  Clean off-white, dark-mode-ready via `class` strategy
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          50: "#f2fdf0",
          100: "#e2fadc",
          200: "#c9f7b9",
          300: "#a3ec8d",
          400: "#7ddd61",
          500: "#58cb3f",
          600: "#3faf2a",
          700: "#338f24",
          800: "#2d7522",
          900: "#1d4d2b",
          950: "#102a18",
        },
        navy: {
          50: "#f0f5fa",
          100: "#dce8f4",
          200: "#bccfe6",
          300: "#8fadcf",
          400: "#5c82b0",
          500: "#3d6593",
          600: "#2e5079",
          700: "#264163",
          800: "#223852",
          900: "#0d1b2e",
          950: "#081220",
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        display: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(13 27 46 / 0.06), 0 1px 3px 0 rgb(13 27 46 / 0.08)",
        "card-hover": "0 4px 12px -2px rgb(13 27 46 / 0.10), 0 2px 4px -2px rgb(13 27 46 / 0.06)",
        glow: "0 0 0 1px rgb(99 102 241 / 0.15), 0 8px 32px -8px rgb(99 102 241 / 0.35)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.35s ease-out both",
      },
    },
  },
  plugins: [animate],
};

export default config;
