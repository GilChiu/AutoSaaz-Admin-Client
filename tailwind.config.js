/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#feefd6',
          200: '#fcdcac',
          300: '#fac177',
          400: '#f79940',
          500: '#f57c20',
          600: '#e65c16',
          700: '#be4515',
          800: '#983719',
          900: '#7a2f17',
        }
      }
    },
  },
  plugins: [],
}
