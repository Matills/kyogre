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
        secondary: '#363636',
        accent: '#59CD90',
      },
    },
  },
  plugins: [],
}
