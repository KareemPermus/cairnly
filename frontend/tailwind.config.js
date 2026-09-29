/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#3B82F6', dark: '#2563EB', soft: '#EFF6FF' },
        accent: { DEFAULT: '#F97316', soft: '#FFF7ED' },
        ink: '#0F172A',
        muted: '#64748B',
        line: '#E2E8F0',
        canvas: '#F8FAFC',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { xl: '14px', '2xl': '18px' },
    },
  },
  plugins: [],
};