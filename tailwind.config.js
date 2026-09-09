/** @type {import('tailwindcss').Config} */

// พื้นผิว/ตัวอักษร ต้องสลับค่าได้ตามโหมดมืด/ขาว จึงผูกกับ CSS variable (RGB channel)
// แทนที่จะเป็นเลขฮฤกซ์ตายตัว — ดูค่าจริงของแต่ละโหมดใน src/index.css
function themedColor(varName) {
  return ({ opacityValue }) =>
    opacityValue === undefined ? `rgb(var(${varName}))` : `rgb(var(${varName}) / ${opacityValue})`
}

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Kanit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // พื้นผิวหลักของระบบ — สลับโทนมืด/ขาวได้ด้วยปุ่มสลับโหมด
        surface: {
          canvas: themedColor('--surface-canvas'),
          sunken: themedColor('--surface-sunken'),
          card: themedColor('--surface-card'),
          raised: themedColor('--surface-raised'),
          border: themedColor('--surface-border'),
          borderLight: themedColor('--surface-borderLight'),
        },
        // ตัวอักษร — สลับโทนมืด/ขาวได้เช่นกัน
        mist: {
          100: themedColor('--mist-100'),
          300: themedColor('--mist-300'),
          400: themedColor('--mist-400'),
          500: themedColor('--mist-500'),
          600: themedColor('--mist-600'),
          700: themedColor('--mist-700'),
        },
        // ทองคำ — accent หลักของระบบ (ถ้วยรางวัล/ชัยชนะ)
        gold: {
          300: '#F8D889',
          400: '#F2B33D',
          500: '#E0A020',
          600: '#B87F16',
          700: '#8A5F10',
        },
        // ครั่ง TU — โทนรองใช้เป็น undertone/gradient
        brand: {
          400: '#B23A48',
          500: '#96222F',
          600: '#7A1F2B',
          700: '#5C1721',
          800: '#3D0F16',
          900: '#270A0F',
        },
        team: {
          blue: { DEFAULT: '#0284C7', soft: '#38BDF8', dim: '#0C4A6E' },
          purple: { DEFAULT: '#9333EA', soft: '#C084FC', dim: '#4C1D95' },
          pink: { DEFAULT: '#DB2777', soft: '#F472B6', dim: '#831843' },
          green: { DEFAULT: '#16A34A', soft: '#4ADE80', dim: '#14532D' },
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,.3), 0 4px 16px rgba(0,0,0,.35)',
        card: '0 10px 30px rgba(0,0,0,.45)',
        pop: '0 24px 60px rgba(0,0,0,.55)',
        glowGold: '0 0 0 1px rgba(242,179,61,.4), 0 0 24px rgba(242,179,61,.35)',
        glowBlue: '0 0 24px rgba(56,189,248,.35)',
        glowPurple: '0 0 24px rgba(192,132,252,.35)',
        glowPink: '0 0 24px rgba(244,114,182,.35)',
        glowGreen: '0 0 24px rgba(74,222,128,.35)',
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
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        tumble: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.55 },
          '50%': { opacity: 1 },
        },
        drift: {
          '0%': { transform: 'translate(0,0)' },
          '50%': { transform: 'translate(-2%, 2%)' },
          '100%': { transform: 'translate(0,0)' },
        },
      },
      animation: {
        popIn: 'popIn 0.4s cubic-bezier(0.16,1,0.3,1) both',
        fadeIn: 'fadeIn 0.3s ease-out both',
        floaty: 'floaty 3s ease-in-out infinite',
        tumble: 'tumble 0.7s cubic-bezier(0.65,0,0.35,1) infinite',
        pulseGlow: 'pulseGlow 2.2s ease-in-out infinite',
        drift: 'drift 12s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
