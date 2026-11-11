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
        brand: {
          bg: 'rgb(var(--bg-primary-rgb) / <alpha-value>)',
          surface: 'rgb(var(--bg-surface-rgb) / <alpha-value>)',
          card: 'rgb(var(--bg-card-rgb) / <alpha-value>)',
          hover: 'rgb(var(--bg-hover-rgb) / <alpha-value>)',
          border: 'rgb(var(--border-primary-rgb) / <alpha-value>)',
          accent: 'rgb(var(--brand-accent-rgb) / <alpha-value>)',
          accentHover: 'rgb(var(--brand-accent-hover-rgb) / <alpha-value>)',
          accentMuted: 'rgb(var(--brand-accent-rgb) / 0.15)',
          whiteWin: '#ffffff',
          draw: '#94a3b8',
          blackWin: '#1e293b',
          boardLight: '#eeeed2',
          boardDark: '#769656'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
