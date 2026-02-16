/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-orange': '#F98906',
        'brand-hover': '#E07A00',
        'background': '#FFF5E6',
        'background-alt': '#FFFBF5',
        'text-primary': '#1A1A1A',
        'text-secondary': '#2C1A0E',
        'text-muted': '#5C4A3D',
        'border': '#1A1A1A',
        'border-light': 'rgba(26, 26, 26, 0.15)',
        'surface': '#FFFFFF',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'Times New Roman', 'serif'],
        serif: ['Source Serif 4', 'Georgia', 'Times New Roman', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      borderWidth: {
        DEFAULT: '1px',
      },
    },
  },
  plugins: [],
}
