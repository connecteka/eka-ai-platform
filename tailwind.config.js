/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        'brand-orange': 'var(--eka-orange)',
        'brand-hover': 'var(--eka-orange-hover)',
        'brand-purple': 'var(--g4g-purple)',
        'background': 'var(--bg-primary)',
        'background-alt': 'var(--bg-secondary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'border': 'var(--border-primary)',
        'border-light': 'var(--border-light)',
        'surface': 'var(--surface)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        serif: 'var(--font-display)',
        sans: 'var(--font-primary)',
        mono: 'var(--font-mono)',
      },
      borderWidth: {
        DEFAULT: '1px',
      },
      boxShadow: {
        'xs': 'var(--shadow-xs)',
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'orange': 'var(--shadow-orange)',
        'orange-lg': 'var(--shadow-orange-lg)',
        'inner': 'var(--shadow-inner)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
    },
  },
  plugins: [],
}
