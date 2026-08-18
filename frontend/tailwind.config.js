/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" }
    },
    extend: {
      colors: {
        dark: {
          950: "#090909",
          900: "#0d0d0d",
          850: "#131313",
          800: "#171717",
          750: "#1c1c1c",
          700: "#212121",
          600: "#2a2a2a",
          500: "#2f2f2f",
          400: "#404040",
          300: "#525252",
          200: "#737373",
          100: "#a3a3a3"
        },
        gpt: {
          green: "#10a37f",
          emerald: "#10b981",
          hover: "#1a7f64",
          user: "#2f2f2f",
          surface: "#212121",
          border: "#333333"
        },
        ink: {
          DEFAULT: "#f3f4f6",
          50: "#171717",
          100: "#262626",
          200: "#333333",
          300: "#737373",
          400: "#9ca3af",
          500: "#d1d5db",
          600: "#e5e7eb",
          700: "#f3f4f6",
          800: "#f9fafb",
          900: "#ffffff"
        },
        paper: {
          DEFAULT: "#0d0d0d",
          soft: "#171717",
          card: "#212121"
        },
        highlight: {
          DEFAULT: "#10a37f",
          soft: "rgba(16, 163, 127, 0.15)",
          strong: "#10b981"
        },
        teal: {
          DEFAULT: "#10a37f",
          soft: "rgba(16, 163, 127, 0.15)"
        },
        border: "#2f2f2f",
        ring: "#10a37f",
        destructive: "#ef4444",
        muted: "#9ca3af"
      },
      fontFamily: {
        display: ["var(--font-display)", "Inter", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"]
      },
      borderRadius: {
        card: "14px",
        chip: "999px"
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.2)",
        popover: "0 12px 36px rgba(0, 0, 0, 0.6)",
        glow: "0 0 20px rgba(16, 163, 127, 0.2)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" }
        },
        blink: {
          "0%, 80%, 100%": { opacity: 0.2 },
          "40%": { opacity: 1 }
        },
        pulseGlow: {
          "0%, 100%": { opacity: 0.6, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.05)" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out forwards",
        blink: "blink 1.4s infinite both",
        "pulse-glow": "pulseGlow 2s infinite ease-in-out"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
