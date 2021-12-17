module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    textColor: ['responsive', 'hover', 'focus', 'group-hover'],
    width: ["responsive", "hover", "focus"],
    height: ["responsive", "hover", "focus"],
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
