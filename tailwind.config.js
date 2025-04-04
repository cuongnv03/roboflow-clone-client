/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Add custom Roboflow-like colors if needed
      colors: {
        'sidebar-bg': '#1a202c', // Example dark background
        'sidebar-text': '#a0aec0', // Example text color
        'sidebar-active': '#4a0d78', // Example active item bg
        'sidebar-hover': '#2d3748', // Example hover bg
        'brand-purple': '#9333ea', // Primary brand color
        'brand-purple-dark': '#7e22ce', // Hover/active state
        'brand-gray': '#1f2937', // Sidebar background
        'brand-text': '#d1d5db', // Sidebar text
      },
    },
  },
  plugins: [],
}
