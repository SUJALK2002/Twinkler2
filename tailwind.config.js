/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#203858',
          'navy-deep': '#172b46',
          cream: '#fff6e7',
          orange: '#f29a3f',
          'orange-dark': '#b9651e',
          blue: '#668fb5',
          green: '#7f9e77',
          purple: '#9487ba',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
