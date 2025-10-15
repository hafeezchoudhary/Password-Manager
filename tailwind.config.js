/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'button-gradient': 'linear-gradient(to right, #8b5cf6, #3b82f6)',
        'primary-gradient': 'linear-gradient(to right, #0b0b0d, #141316)',
      },
      colors: {
        primary: "#6C5CE7", // your brand color
      },
    },
  },
  plugins: [],
};
