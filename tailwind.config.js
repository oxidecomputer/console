const colors = require('tailwindcss/colors')

module.exports = {
  theme: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      mono: ['GT America Mono', 'monospace'],
    },
    colors: {
      gray: colors.gray,
      white: colors.white,
      black: colors.black,
      red: {
        50: '#fdf8f9',
        100: '#fbf1f3',
        200: '#f5dbe1',
        300: '#efc6cf',
        400: '#e49bab',
        500: '#D87087',
        600: '#c2657a',
        700: '#a25465',
        800: '#824351',
        900: '#6a3742',
      },
      yellow: {
        50: '#fefdf8',
        100: '#fdfaf1',
        200: '#fbf4dd',
        300: '#f9edc8',
        400: '#f4df9f',
        500: '#EFD176',
        600: '#d7bc6a',
        700: '#b39d59',
        800: '#8f7d47',
        900: '#75663a',
      },
      blue: {
        50: '#f9f9fe',
        100: '#f2f4fe',
        200: '#dfe3fc',
        300: '#cbd2fa',
        400: '#a4b1f6',
        500: '#7D8FF2',
        600: '#7181da',
        700: '#5e6bb6',
        800: '#4b5691',
        900: '#3d4677',
      },
      green: {
        50: '#f6fdfa',
        100: '#edfbf5',
        200: '#d1f5e5',
        300: '#b6eed5',
        400: '#7fe2b6',
        500: '#48D597',
        600: '#41c088',
        700: '#36a071',
        800: '#2b805b',
        900: '#23684a',
      },
    },
    extend: {
      backgroundColor: {
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        tertiary: 'var(--color-primary)',
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        tertiary: 'var(--color-primary)',
      },
      opacity: {
        8: 0.08,
        16: 0.16,
        24: 0.24,
      },
      outline: {
        blue: `1px solid ${colors.blue[500]}`,
      },
    },
  },
  plugins: [],
}
