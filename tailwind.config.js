/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Kanit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        tu: {
          maroon: '#7A1F2B',
          gold: '#C9A227',
        },
        team: {
          blue: {
            DEFAULT: '#2563EB',
            light: '#DBEAFE',
            dark: '#1E3A8A',
          },
          purple: {
            DEFAULT: '#7C3AED',
            light: '#EDE3FE',
            dark: '#4C1D95',
          },
          pink: {
            DEFAULT: '#DB2777',
            light: '#FCE3EF',
            dark: '#831843',
          },
          green: {
            DEFAULT: '#16A34A',
            light: '#DCFCE7',
            dark: '#14532D',
          },
        },
      },
      boxShadow: {
        soft: '0 2px 10px rgba(15, 23, 42, 0.06)',
        card: '0 4px 20px rgba(15, 23, 42, 0.08)',
      },
      keyframes: {
        popIn: {
          '0%': { opacity: 0, transform: 'translateY(6px) scale(0.98)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        popIn: 'popIn 0.35s ease-out both',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
}
