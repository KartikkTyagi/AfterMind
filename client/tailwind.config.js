/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5F0E8',
        'warm-white': '#FAF7F2',
        'deep-brown': '#2C1810',
        'warm-brown': '#6B3F2A',
        amber: '#C17D3C',
        'soft-gold': '#D4A853',
        'muted-rose': '#C4957A',
        'dark-charcoal': '#1A1A1A',
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(44, 24, 16, 0.06)',
        'premium': '0 10px 30px rgba(44, 24, 16, 0.08)',
      }
    },
  },
  plugins: [],
}
