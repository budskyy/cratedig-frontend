/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'ts-black': '#000000',
        'ts-surface': '#0a0a0a',
        'ts-card': '#111111',
        'ts-border': '#1a1a1a',
        'ts-hover': '#1f1f1f',
        'ts-gold': '#c9a84c',
        'ts-gold-dim': '#8a6f2e',
        'ts-white': '#f5f5f0',
        'ts-muted': '#666666',
        'ts-dim': '#333333',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(201,168,76,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(201,168,76,0.6), 0 0 40px rgba(201,168,76,0.2)' },
        }
      }
    },
  },
  plugins: [],
}
