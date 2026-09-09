/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Kanit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#F7F7FA',
          100: '#EEEEF3',
          200: '#DFE0E8',
          300: '#C3C5D2',
          400: '#9A9DB0',
          500: '#71748A',
          600: '#53556A',
          700: '#3D3F52',
          800: '#282A3B',
          900: '#181A26',
        },
        brand: {
          50: '#FCE9EA',
          100: '#F6C6C9',
          200: '#EEA3A8',
          300: '#DD7079',
          400: '#A8323F',
          500: '#8A2530',
          600: '#7A1F2B',
          700: '#5C1721',
          800: '#3D0F16',
        },
        gold: {
          400: '#E0BC53',
          500: '#C9A227',
          600: '#A9841C',
        },
        team: {
          blue: { DEFAULT: '#0284C7', light: '#E0F2FE', dark: '#075985' },
          purple: { DEFAULT: '#9333EA', light: '#F3E8FF', dark: '#6B21A8' },
          pink: { DEFAULT: '#DB2777', light: '#FCE7F3', dark: '#9D174D' },
          green: { DEFAULT: '#16A34A', light: '#DCFCE7', dark: '#166534' },
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(24, 26, 38, 0.04), 0 4px 12px rgba(24, 26, 38, 0.05)',
        card: '0 8px 24px rgba(24, 26, 38, 0.08), 0 2px 6px rgba(24, 26, 38, 0.04)',
        pop: '0 16px 40px rgba(24, 26, 38, 0.14)',
        glow: '0 0 0 4px',
      },
      keyframes: {
        popIn: {
          '0%': { opacity: 0, transform: 'translateY(8px) scale(0.97)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        shimmer: {
          '0%': { backgroundPosition: '-300% 0' },
          '100%': { backgroundPosition: '300% 0' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        tumble: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(122,31,43,0.35)' },
          '100%': { boxShadow: '0 0 0 12px rgba(122,31,43,0)' },
        },
      },
      animation: {
        popIn: 'popIn 0.4s cubic-bezier(0.16,1,0.3,1) both',
        fadeIn: 'fadeIn 0.3s ease-out both',
        shimmer: 'shimmer 2s linear infinite',
        floaty: 'floaty 3s ease-in-out infinite',
        tumble: 'tumble 0.7s cubic-bezier(0.65,0,0.35,1) infinite',
        pulseRing: 'pulseRing 1.6s cubic-bezier(0,0,0.2,1) infinite',
      },
      backgroundImage: {
        'grid-fade':
          'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(247,247,250,1) 100%), radial-gradient(circle at 1px 1px, rgba(24,26,38,0.06) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
}
