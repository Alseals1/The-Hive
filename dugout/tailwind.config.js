/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        field: {
          50:  '#f0fdf4',
          500: '#22c55e',
          700: '#15803d',
        },
        dugout: {
          dark:  '#1c1917',
          mid:   '#44403c',
          light: '#a8a29e',
        },
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [],
}

