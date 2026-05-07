const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        mono: ['var(--font-fira-code)', ...fontFamily.mono],
      },
      colors: {
        // Base
        charcoal: {
          DEFAULT: '#2D2D2D',
          light: '#3E3E3E',
          dark: '#1C1C1C',
          darker: '#121212',
        },
        bone: {
          DEFAULT: '#E0DCD3',
          dark: '#A3A3A3',
        },
        
        // Accents
        blood: {
          DEFAULT: '#8A0707',
          light: '#C73B3B',
          dark: '#5C0000',
        },
        soul: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#2563EB',
        },
        moss: {
          DEFAULT: '#22C55E',
          light: '#4ADE80',
          dark: '#16A34A',
        },
      },
    },
  },
  plugins: [],
};
