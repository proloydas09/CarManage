/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core background layers
        bg: {
          base: "rgb(var(--bg-base) / <alpha-value>)",
          surface: "rgb(var(--bg-surface) / <alpha-value>)",
          elevated: "rgb(var(--bg-elevated) / <alpha-value>)",
          overlay: "rgb(var(--bg-overlay) / <alpha-value>)",
          border: "rgb(var(--bg-border) / <alpha-value>)",
          muted: "rgb(var(--bg-muted) / <alpha-value>)",
        },
        // Brand — electric indigo
        brand: {
          50: "#eef0ff",
          100: "#e0e3ff",
          200: "#c7cbff",
          300: "#a5abff",
          400: "#818aff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        // Semantic
        success: { DEFAULT: "#10b981", muted: "#10b98122" },
        danger: { DEFAULT: "#ef4444", muted: "#ef444422" },
        warning: { DEFAULT: "#f59e0b", muted: "#f59e0b22" },
        info: { DEFAULT: "#3b82f6", muted: "#3b82f622" },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-dm-mono)", "ui-monospace", "monospace"],
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        glow: "0 0 20px 0 rgba(99,102,241,0.25)",
        "glow-sm": "0 0 10px 0 rgba(99,102,241,0.15)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "grid-pattern": "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0M-5 5L5-5M35 45L45 35' stroke='%23ffffff06' stroke-width='1'/%3E%3C/svg%3E\")",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-in-up": "slideInUp 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideInRight: { "0%": { transform: "translateX(100%)", opacity: "0" }, "100%": { transform: "translateX(0)", opacity: "1" } },
        slideInUp: { "0%": { transform: "translateY(8px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        pulseGlow: { "0%,100%": { boxShadow: "0 0 10px rgba(99,102,241,0.1)" }, "50%": { boxShadow: "0 0 25px rgba(99,102,241,0.4)" } },
      },
    },
  },
  plugins: [],
};
