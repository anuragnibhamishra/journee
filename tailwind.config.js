/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#121211', 900: '#171716', 850: '#1c1c1b', 800: '#222221', 700: '#2b2b29', 600: '#3a3a37' },
        bone: { 100: '#ece8df', 300: '#bdb8ac', 500: '#8b877d', 600: '#67645c' },
        sand: '#c8b88f',
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
