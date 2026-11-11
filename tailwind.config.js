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
          bg: '#0c1017',
          surface: '#141b24',
          card: '#1a2230',
          hover: '#242e40',
          border: '#2a364a',
          accent: '#48c774', // Chess-inspired vibrant green for 'exp' wordmark & highlights
          accentHover: '#3eb367',
          accentMuted: 'rgba(72, 199, 116, 0.15)',
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
