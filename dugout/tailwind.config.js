/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        // Dark pitch backgrounds
        pitch: {
          950: '#07070A',
          900: '#0D0D11',
          800: '#13131A',
          700: '#1A1A23',
          600: '#22222E',
          500: '#2E2E3D',
          400: '#44445A',
          300: '#636378',
          200: '#8E8EA4',
          100: '#C2C2D0',
          50:  '#F0F0F5',
        },
        // Ember orange — stadium lights
        ember: {
          DEFAULT: '#FF5C1A',
          600: '#E04A0F',
          muted: 'rgba(255,92,26,0.15)',
        },
        // Field green
        field: {
          DEFAULT: '#2ECC71',
          600: '#27AE60',
          muted: 'rgba(46,204,113,0.15)',
          50: "#f0fdf4",
          500: "#2ECC71",
          700: "#27AE60",
        },
        // Brand alias for backward compat
        brand: {
          50:  "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#FF5C1A",
          600: "#E04A0F",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        // Dugout semantic tokens (now dark-bg aware)
        dugout: {
          dark:  "#F0F0F5",
          mid:   "#8E8EA4",
          light: "#44445A",
        },
      },
      borderRadius: {
        card: "14px",
      },
      backgroundImage: {
        'ember-gradient': 'linear-gradient(135deg, #FF5C1A 0%, #E04A0F 100%)',
      },
    },
  },
  plugins: [],
};
