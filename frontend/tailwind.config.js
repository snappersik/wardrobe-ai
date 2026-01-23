/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff91af',
        'primary-hover': '#ff7aa0',
      },
    },
  },
  plugins: [],
}
