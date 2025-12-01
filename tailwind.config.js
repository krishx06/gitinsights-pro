/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f1116',
          card: '#161b22',
          sidebar: '#1a1f2e',
          border: '#30363d',
        }
      }
    },
  },
  plugins: [],
}