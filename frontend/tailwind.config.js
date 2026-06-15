/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Argentina 🇦🇷
        'celeste-afa': '#75AADB',
        'celeste-light': '#A8CDEC',
        'celeste-dark': '#4A8FCC',
        'amarillo-oro': '#F6B40E',
        'azul-oscuro': '#1E3A8A',
        'blanco': '#FFFFFF',
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-celeste': 'linear-gradient(135deg, #75AADB 0%, #FFFFFF 100%)',
        'gradient-oro': 'linear-gradient(135deg, #F6B40E 0%, #FFC947 100%)',
      },
    },
  },
  plugins: [],
}

