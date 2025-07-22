/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'menu-gradient': 'linear-gradient(180deg, #1a1a3a 0%, #2d2d5f 25%, #3a3a7a 50%, #4a4a9a 75%, #5a5aba 100%)',
      },
      boxShadow: {
        'menu': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};
