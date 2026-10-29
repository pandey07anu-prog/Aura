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
          bg: '#080808',
          secondary: '#111111',
          card: '#171717',
          cardHover: '#1f1f1f',
          border: '#292929',
          borderLight: '#383838',
        },
        fintech: {
          text: '#FFFFFF',
          muted: '#A3A3A3',
          subtle: '#666666',
          accent: '#FFFFFF',
          green: '#10B981',
          greenSubtle: 'rgba(16, 185, 129, 0.12)',
          red: '#EF4444',
          redSubtle: 'rgba(239, 68, 68, 0.12)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(255, 255, 255, 0.05)',
        'glow-md': '0 0 30px rgba(255, 255, 255, 0.08)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 3s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      }
    },
  },
  plugins: [],
}
