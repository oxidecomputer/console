const twColors = require('tailwindcss/colors')

// TODO: gray 100-800 and green 300-900 are from the old color scheme, but it's
// not worth going through and converting all uses of them to the new colors
// because those uses will disappear with the new designs anyway

const colors = {
  transparent: 'transparent',
  current: 'currentColor',
  black: '#0B1418',
  white: '#FFFFFF',
  gray: {
    100: twColors.gray[100],
    200: twColors.gray[200],
    300: twColors.gray[300],
    500: twColors.gray[500],
    700: twColors.gray[700],
    800: twColors.gray[800],
  },
  grey: {
    50: '#E7E7E8',
    100: '#AAAFB1',
    200: '#969A9C',
    300: '#646A6D',
    400: '#30373B',
    500: '#192125',
  },
  red: {
    500: '#E86886',
    600: '#BC5770',
    700: '#8F465A',
    800: '#643644',
    900: '#37252E',
    950: '#211C23',
  },
  yellow: {
    500: '#F5CF65',
    900: '#3A3927',
  },
  blue: {
    DEFAULT: '#4969F6',
    tint: '#142139',
  },
  green: {
    tint: '#14312B',
    300: '#b6eed5',
    400: '#7fe2b6',
    500: '#48D597',
    600: '#41c088',
    700: '#36a071',
    900: '#23684a',
  },
  TODO: '#FF0000',
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
