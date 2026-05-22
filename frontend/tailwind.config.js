// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fdf8f0',
          100: '#faefd8',
          200: '#f4dba8',
          300: '#ecc06e',
          400: '#e3a040',
          500: '#d4841f',
          600: '#b86816',
          700: '#984f15',
          800: '#7c4018',
          900: '#673618',
        },
        charcoal: '#1a1a2e',
        cream: '#faf7f2',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideInRight: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
      }
    },
  },
  plugins: [],
}