/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc', // Light Gray (Off-white)
        surface: '#ffffff',    // White cards
        primary: '#11231f',    // Dark Forest Green (Brand)
        secondary: '#4b5563',  // Slate Gray (Text)
        accent: '#bef264',     // Lime Green

        // Risk/Status Colors (Adjusted for light theme)
        success: '#10b981',    // Emerald
        warning: '#f59e0b',    // Amber
        danger: '#ef4444',     // Red

        // Custom grays from image
        'dark-card': '#11231f', // For dashboard sidebar
        'lime-btn': '#bef264',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
