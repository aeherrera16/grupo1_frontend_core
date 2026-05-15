/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        banker: {
          navy: '#001f3f',
          'navy-light': '#003d66',
          'navy-lighter': '#0052a3',
          gray: {
            light: '#f8f9fa',
            lighter: '#e9ecef',
            medium: '#6c757d',
            dark: '#495057',
          },
          white: '#ffffff',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
        }
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.07)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        DEFAULT: '6px',
      },
    },
  },
  plugins: [],
}
