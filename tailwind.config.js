import forms from '@tailwindcss/forms'

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-purple': '#9333ea',
        'brand-purple-dark': '#7e22ce',
        'brand-gray': '#1f2937',
        'brand-text': '#d1d5db',
      },
    },
  },
  plugins: [forms],
}
