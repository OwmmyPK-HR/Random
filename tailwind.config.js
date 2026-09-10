/** @type {import('tailwindcss').Config} */

// พื้นผิว/ตัวอักษร ต้องสลับค่าได้ตามโหมดมืด/ขาว จึงผูกกับ CSS variable (RGB channel)
// แทนที่จะเป็นเลขฮฤกซ์ตายตัว — ดูค่าจริงของแต่ละโหมดใน src/index.css
function themedColor(varName) {
  return ({ opacityValue }) =>
    opacityValue === undefined ? `rgb(var(${varName}))` : `rgb(var(${varName}) / ${opacityValue})`
}

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // เปิดให้ dark: ใช้กับ [data-theme="dark"] ได้ สำหรับจุดที่ต้องออกแบบต่างกันจริง ๆ ระหว่างสองโหมด
  // (ไม่ใช่แค่สลับค่าสี) — ปกติสีพื้นผิว/ตัวอักษร/accent ใช้ CSS variable สลับเองอยู่แล้วโดยไม่ต้องพึ่งตัวนี้
  darkMode: ['selector', '[data-theme="dark"]'],
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
        // accent หลักของระบบ (ปุ่ม/ลิงก์/nav ที่ active) — โหมดขาว = เขียวป่า, โหมดมืด = ทอง
        accent: {
          DEFAULT: themedColor('--accent'),
          soft: themedColor('--accent-soft'),
          contrast: themedColor('--accent-contrast'), // สีตัวอักษรบนพื้น accent
        },
        // ทองคำ — คงไว้ใช้ตกแต่ง (ถ้วยรางวัล ริง ฯลฯ) ไม่ขึ้นกับโหมด
        gold: {
          300: '#F8D889',
          400: '#F2B33D',
          500: '#E0A020',
          600: '#B87F16',
          700: '#8A5F10',
        },
        // เขียวป่า — ใช้กับภาพประกอบ/แผงตกแต่งที่ตั้งใจให้เขียวเข้มเสมอไม่ว่าโหมดไหน
        pine: {
          600: '#1B8560',
          700: '#146B4F',
          800: '#0F3D2E',
          900: '#0A2E22',
        },
        // ครั่ง TU — โทนเอกลักษณ์หลัก ใช้กับโลโก้/หัวข้อ/eyebrow
        brand: {
          50: '#FBEAEC',
          100: '#F3CDD1',
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
        soft: '0 1px 2px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.06)',
        card: '0 10px 30px rgba(0,0,0,.1)',
        pop: '0 24px 60px rgba(0,0,0,.22)',
        glowAccent: '0 0 0 1px rgb(var(--accent) / .35), 0 0 24px rgb(var(--accent) / .3)',
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
        wobble: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-7px) rotate(-9deg)' },
          '75%': { transform: 'translateY(-2px) rotate(9deg)' },
        },
        settlePop: {
          '0%': { transform: 'scale(0.65)', opacity: 0 },
          '55%': { transform: 'scale(1.18)', opacity: 1 },
          '100%': { transform: 'scale(1)' },
        },
        ringBurst: {
          '0%': { transform: 'scale(0.5)', opacity: 0.9 },
          '100%': { transform: 'scale(2.1)', opacity: 0 },
        },
      },
      animation: {
        popIn: 'popIn 0.4s cubic-bezier(0.16,1,0.3,1) both',
        fadeIn: 'fadeIn 0.3s ease-out both',
        floaty: 'floaty 3s ease-in-out infinite',
        tumble: 'tumble 0.7s cubic-bezier(0.65,0,0.35,1) infinite',
        pulseGlow: 'pulseGlow 2.2s ease-in-out infinite',
        drift: 'drift 12s ease-in-out infinite',
        wobble: 'wobble 0.5s ease-in-out infinite',
        settlePop: 'settlePop 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
        ringBurst: 'ringBurst 0.75s ease-out both',
      },
    },
  },
  plugins: [],
}
