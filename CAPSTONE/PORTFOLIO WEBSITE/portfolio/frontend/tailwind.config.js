/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        burgundy: '#800020',
        gold: '#D4AF37',
        beige: '#F5F0E8',
        'dark-bg': '#1A1A2E',
        'dark-text': '#E0E0E0',
      },
      backdropBlur: {
        glass: '12px',
      },
      backgroundOpacity: {
        'glass-light': '0.15',
        'glass-dark': '0.08',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
