/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'royal-blue': '#014AAD',
        'sky-blue': '#60B9F3',
        // Neutral Tones
        'charcoal': '#333333',
        'light-gray': '#F2F2F2',
        // Accent Colors
        'bright-cyan': '#00D2FF',
        'soft-white': '#FFFFFF',
        // Additional shades for better design flexibility
        'royal-blue-dark': '#013A8A',
        'royal-blue-light': '#0156C7',
        'sky-blue-light': '#80C9F6',
        'sky-blue-dark': '#4AA8E8',
        'charcoal-light': '#4A4A4A',
        'charcoal-dark': '#1A1A1A',
      },
      fontFamily: {
        'apos': ['Apos', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};