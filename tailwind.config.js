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
          bg: 'var(--bg-primary)',
          surface: 'var(--bg-surface)',
          card: 'var(--bg-card)',
          hover: 'var(--bg-hover)',
          border: 'var(--border-primary)',
          accent: 'var(--brand-accent)',
          accentHover: 'var(--brand-accent-hover)',
          accentMuted: 'var(--brand-accent-muted)',
          text: 'var(--text-primary)',
          textMuted: 'var(--text-muted)',
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
