const twColors = require('tailwindcss/colors')

const colors = {
  transparent: 'transparent',
  current: 'currentColor',
  black: '#0B1418',
  gray: twColors.gray,
  grey: {
    1: '#AAAFB1',
    2: '#969A9C',
    3: '#646A6D',
    4: '#30373B',
    5: '#192125',
  },
  white: {
    DEFAULT: '#FFFFFF',
    off: '#E7E7E8',
  },
  red: {
    DEFAULT: '#E86886',
    tint: '#2C2128',
  },
  yellow: {
    DEFAULT: '#F5CF65',
    tint: '#2E3024',
  },
  blue: {
    DEFAULT: '#4969F6',
    tint: '#142139',
  },
  green: {
    DEFAULT: '#48D597',
    tint: '#14312B',
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
    black: '#001712',
  },
  'dark-green': {
    700: '#20463b', // TODO: picked hastily, revisit
    800: '#18342c',
    900: '#172524',
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
