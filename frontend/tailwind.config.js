/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0f1d',
        surface: '#111827',
        'surface-elevated': '#1a2234',
        'surface-border': '#243049',
        primary: {
          DEFAULT: '#00d2ff',
          hover: '#00b8e6',
          dark: '#008ba3',
        },
        secondary: '#3a86ff',
        accent: '#00f2fe',
        bullish: '#10b981',
        bearish: '#ef4444',
        neutral: '#f59e0b',
        muted: '#94a3b8',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

