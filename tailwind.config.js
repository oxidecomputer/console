const colors = {
  transparent: 'transparent',
  current: 'currentColor',
  black: '#0B1418',
  white: '#FFFFFF',
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
    500: '#4969F6',
    900: '#142139',
  },
  green: {
    300: '#b6eed5', // TODO: remove, not in design v2
    400: '#7fe2b6', // TODO: remove, not in design v2
    500: '#48D597',
    600: '#3CAE7E',
    700: '#2F8865',
    900: '#173B31',
    950: '#112725',
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
