/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
  extend: {
      colors: {
        // Base colors from CSS variables
        primary: "var(--primary-color)",
        "primary-light": "var(--primary-light)",
        secondary: "var(--secondary-color)",
        "secondary-dark": "var(--secondary-dark)",

        // Auto-generated utility variants
        "text-primary": "var(--primary-color)",
        "text-primary-light": "var(--primary-light)",
        "text-secondary": "var(--secondary-color)",
        "text-secondary-dark": "var(--secondary-dark)",

        "bg-primary": "var(--primary-color)",
        "bg-primary-light": "var(--primary-light)",
        "bg-secondary": "var(--secondary-color)",
        "bg-secondary-dark": "var(--secondary-dark)",

        "border-primary": "var(--primary-color)",
        "border-primary-light": "var(--primary-light)",
        "border-secondary": "var(--secondary-color)",
        "border-secondary-dark": "var(--secondary-dark)",
      },
    },
  },
  plugins: [],
};
