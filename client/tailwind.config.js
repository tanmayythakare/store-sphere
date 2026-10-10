/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          canvas: '#fefcfb',
          dark: '#0a1128',
          navy: '#001f54',
          primary: '#034078',
          accent: '#1282a2',
        },
      },
    },
  },
  plugins: [],
}
