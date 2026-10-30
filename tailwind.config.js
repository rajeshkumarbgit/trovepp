/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#265A40',
          deep: '#1C4430',
          sage: '#80A58E',
          gold: '#B8925A',
          sand: '#D9B37E',
          mint: '#E8EFEA',
          cream: '#FAF3E7',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Montserrat"', '"Inter"', 'sans-serif'],
      },
      maxWidth: {
        site: '72rem',
      },
    },
  },
  plugins: [],
};
