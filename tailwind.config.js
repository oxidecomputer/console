const twColors = require('tailwindcss/colors')

const colors = {
  transparent: 'transparent',
  current: 'currentColor',
  gray: twColors.gray,
  white: twColors.white,
  black: twColors.black,
  purple: twColors.purple,
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
  'dark-red': '#2e2429',
  'dark-yellow': '#323327',
  'dark-green': {
    700: '#20463b', // TODO: picked hastily, revisit
    800: '#18342c',
    900: '#172524',
  },
  'dark-blue': '#20293b',
  'dark-purple': '#27203c',
  'blue-gray': {
    800: '#1d2225',
    900: '#0e1518',
  },
}

module.exports = {
  theme: {
    extend: {
      fontSize: {
        xxs: ['.6875rem', '1rem'],
      },
      opacity: {
        64: '.64',
      },
      boxShadow: {
        'ring-white': `inset 0 0 0 1px ${colors.white}`,
        'ring-green-300': `inset 0 0 0 1px ${colors.green[300]}`,
        'ring-green-500': `inset 0 0 0 1px ${colors.green[500]}`,
      },
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      mono: ['GT America Mono', 'monospace'],
    },
    colors,
  },
}
