/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f9e6f9",
          100: "#f2ccf2",
          200: "#e699e6",
          300: "#db66db",
          400: "#d133d1",
          500: "#c600c6",
          600: "#b300b3",
          700: "#8b008b",
          800: "#760076",
          900: "#610061",
        },
      },
      backgroundColor: ({ theme }) => ({
        ...theme("colors"),
        "primary-700": theme("colors.primary.700"),
        "primary-800": theme("colors.primary.800"),
      }),
      borderColor: ({ theme }) => ({
        ...theme("colors"),
        "primary-700": theme("colors.primary.700"),
      }),
    },
  },
  plugins: [],
};
