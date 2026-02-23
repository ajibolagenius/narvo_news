/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        'primary': '#EBD5AB',
        'forest': '#628141',
        'background-dark': '#1B211A',
        'surface': '#242B23',
        'text-primary': '#F2F2F2',
        'text-secondary': '#8BAE66',
        'text-dim': '#808080',
        // Aliases for backward compatibility
        'narvo-bg': '#1B211A',
        'narvo-surface': '#242B23',
        'narvo-border': '#628141',
        'narvo-primary': '#EBD5AB',
        'narvo-text': '#F2F2F2',
        'narvo-text-secondary': '#8BAE66',
        'narvo-text-dim': '#808080',
      },
      fontFamily: {
        'display': ['Space Grotesk', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
        // Aliases
        'header': ['Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        'none': '0',
        'DEFAULT': '0',
        'sm': '0',
        'md': '0',
        'lg': '0',
        'xl': '0',
        '2xl': '0',
        '3xl': '0',
        'full': '0',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'breathe': 'breathe 3s ease-in-out infinite',
        'scan': 'scan 4s linear infinite',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '0.15' },
          '50%': { opacity: '0.4' },
        },
        scan: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
