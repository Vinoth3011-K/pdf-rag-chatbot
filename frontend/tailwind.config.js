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
        ink: {
          DEFAULT: "#161B2E",
          50: "#F3F4F8",
          100: "#E4E6EF",
          200: "#C3C7DA",
          300: "#9BA1BE",
          400: "#6B7299",
          500: "#454C74",
          600: "#2E3457",
          700: "#1F2440",
          800: "#161B2E",
          900: "#0D1020"
        },
        paper: {
          DEFAULT: "#F3F4F1",
          soft: "#EAEBE6",
          card: "#FFFFFF"
        },
        highlight: {
          DEFAULT: "#E8AA2E",
          soft: "#FCEBC0",
          strong: "#C6890F"
        },
        teal: {
          DEFAULT: "#12766A",
          soft: "#DCEEEA"
        },
        border: "#DDDFD8",
        ring: "#E8AA2E",
        destructive: "#B4432E",
        muted: "#6B7299"
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"]
      },
      borderRadius: {
        card: "10px",
        chip: "999px"
      },
      boxShadow: {
        card: "0 1px 2px rgba(22, 27, 46, 0.06), 0 1px 8px rgba(22, 27, 46, 0.04)",
        popover: "0 8px 30px rgba(22, 27, 46, 0.14)"
      },
      keyframes: {
        "highlight-sweep": {
          "0%": { backgroundSize: "0% 40%" },
          "100%": { backgroundSize: "100% 40%" }
        },
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" }
        },
        blink: {
          "0%, 80%, 100%": { opacity: 0.2 },
          "40%": { opacity: 1 }
        }
      },
      animation: {
        "highlight-sweep": "highlight-sweep 0.6s ease-out forwards",
        "fade-up": "fade-up 0.35s ease-out forwards",
        blink: "blink 1.4s infinite both"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
