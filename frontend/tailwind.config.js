/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'narvo-bg': '#1B211A',
        'narvo-surface': '#242B23',
        'narvo-border': '#628141',
        'narvo-primary': '#EBD5AB',
        'narvo-text': '#F2F2F2',
        'narvo-text-secondary': '#8BAE66',
        'narvo-text-dim': '#808080',
      },
      fontFamily: {
        'header': ['Space Grotesk', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'grid-breathe': 'gridBreathe 2s ease-in-out infinite',
      },
      keyframes: {
        gridBreathe: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
