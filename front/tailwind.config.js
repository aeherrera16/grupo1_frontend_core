/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        banker: {
          navy: '#102f3f',
          blue: '#1f6173',
          gold: '#b98a3e',
          light: '#f4f7fb',
          dark: '#1f2933',
          gray: '#687684',
        }
      }
    },
  },
  plugins: [],
}
