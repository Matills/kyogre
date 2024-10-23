/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './assets/**/*.{css,scss}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7871AA',
        secondary: '#3C2D70',
        accent: '#0DA99E',
        background: '#363636',
      },
    },
  },
  plugins: [],
}
