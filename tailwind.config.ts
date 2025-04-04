import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import colors from "tailwindcss/colors";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans]
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      colors: {
        // --- Core Palette ---
        primary: {
          DEFAULT: colors.purple[600],
          foreground: colors.white // Text on primary bg
          // Optional: Add shades if needed frequently
          // light: colors.purple[400],
          // dark: colors.purple[800],
        },
        secondary: {
          DEFAULT: colors.teal[500],
          foreground: colors.white // Text on secondary bg
          // Optional: Add shades if needed frequently
          // light: colors.teal[300],
          // dark: colors.teal[700],
        },

        // --- Neutrals & Text ---
        background: colors.white, // Default light background
        foreground: colors.slate[900], // Default text on light background
        "foreground-muted": colors.slate[600], // Less important text

        // --- Borders & Accents ---
        border: colors.slate[200], // Subtle borders on light bg
        ring: colors.purple[500], // Often used for focus rings (matches primary)
        accent: colors.slate[500], // Neutral accent for dividers, etc.

        // --- Dark Mode (Optional - can also use 'dark:' prefix) ---
        // You might prefer using Tailwind's 'dark:' variant instead of separate keys
        // e.g., <body class="bg-background dark:bg-background-dark">
        background_dark: colors.slate[950], // Dark background
        foreground_dark: colors.slate[100], // Text on dark background
        "foreground-muted_dark": colors.slate[400], // Less important text on dark
        border_dark: colors.slate[800], // Subtle borders on dark bg
        accent_dark: colors.slate[600], // Neutral accent on dark bg

        // --- Semantic Colors (Optional) ---
        destructive: {
          DEFAULT: colors.red[600],
          foreground: colors.white
        },
        success: {
          DEFAULT: colors.green[600],
          foreground: colors.white
        },
        warning: {
          DEFAULT: colors.yellow[500],
          foreground: colors.slate[900] // Dark text often better on yellow
        }
      },
      ringColor: ({ theme }) => ({
        DEFAULT: theme("colors.primary.DEFAULT", colors.purple[600])
      })
    }
  },
  plugins: [require("tailwindcss-animate")]
} satisfies Config;
