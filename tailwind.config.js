// @ts-check

/** @type {import('tailwindcss/lib/util/createPlugin').default} */
// @ts-ignore
const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
  content: ['./libs/ui/**/*.{ts,tsx,mdx}', './app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: {
        'xl-': { max: '1535px' },
        'lg-': { max: '1279px' },
        'md-': { max: '1023px' },
        'sm-': { max: '767px' },
        'sm+': { min: '640px' },
        'md+': { min: '768px' },
        'lg+': { min: '1024px' },
        'xl+': { min: '1280px' },
        '2xl+': { min: '1536px' },
        sm: { min: '640px', max: '767px' },
        md: { min: '768px', max: '1023px' },
        lg: { min: '1024px', max: '1279px' },
        xl: { min: '1280px', max: '1535px' },
      },
      borderRadius: {
        DEFAULT: '.0625rem',
      },
    },
    fontFamily: {
      display: ['"Haas Grot Disp Web"', 'sans-serif'],
      sans: ['Inter', 'sans-serif'],
      mono: ['"GT America Mono"', 'monospace'],
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#080F11',
      white: '#FFFFFF',
      gray: {
        50: '#E7E7E8',
        100: '#9EA5A7',
        200: '#808789',
        300: '#62696B',
        400: '#353C3E',
        450: '#2E3537',
        500: '#1D2427',
        550: '#131B1F',
        600: '#0E1518',
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
        600: '#C6AA56',
        700: '#978447',
        800: '#695F36',
        900: '#3A3927',
        950: '#222720',
      },
      blue: {
        500: '#4969F6',
        600: '#3C58CA',
        700: '#30479E',
        800: '#243670',
        900: '#182544',
        950: '#111C2F',
      },
      green: {
        500: '#48D597',
        600: '#3CAE7E',
        700: '#2F8865',
        800: '#24614A',
        900: '#173B31',
        950: '#112725',
      },
    },
  },
  plugins: [
    plugin(({ addVariant, addUtilities, variants }) => {
      // imitation of the twin.macro svg: variant. svg:text-green-500 puts green
      // on an SVG that's an immediate child of the element
      addVariant('svg', '& > svg')
      addVariant('children', '& > *')
      addVariant('between', '& > * + *')
      addUtilities(
        Array.from({ length: 12 }, (_, i) => i)
          .map((i) => ({
            [`.grid-col-${i}`]: {
              'grid-column': `${i}`,
            },
          }))
          .reduce((p, c) => ({ ...p, ...c }), {}),
        variants
      )

      const displayFamily = {
        'font-family': '"Haas Grot Disp Web", sans-serif',
      }
      const monoFamily = {
        'font-family': '"GT America Mono", monospace',
      }
      const sansFamily = {
        'font-family': 'Inter, sans-serif',
      }
      addUtilities({
        '.text-display-md': {
          ...displayFamily,
          'font-size': '1rem',
          'line-height': '1.5',
          'letter-spacing': '0.05rem',
          'font-weight': 300,
        },
        '.text-display-lg': {
          ...displayFamily,
          'font-size': '1.25rem',
          'line-height': '1.3',
          'letter-spacing': '0.04rem',
          'font-weight': 300,
        },
        '.text-display-xl': {
          ...displayFamily,
          'font-size': '1.625rem',
          'line-height': '1.1',
          'letter-spacing': '0.04rem',
          'font-weight': 300,
        },
        '.text-display-2xl': {
          ...displayFamily,
          'font-size': '2.625rem',
          'line-height': '1.1',
          'letter-spacing': '0.03rem',
          'font-weight': 300,
        },
        '.text-mono-xs': {
          ...monoFamily,
          'font-size': '0.625rem',
          'line-height': '1.3',
          'letter-spacing': '0.04rem',
        },
        '.text-mono-sm': {
          ...monoFamily,
          'font-size': '0.6875rem',
          'line-height': '1.27',
          'letter-spacing': '0.04rem',
        },
        '.text-mono-md': {
          ...monoFamily,
          'font-size': '0.75rem',
          'line-height': '1.25',
          'letter-spacing': '0.04rem',
        },
        '.text-mono-lg': {
          ...monoFamily,
          'font-size': '0.75rem',
          'line-height': '1.29',
          'letter-spacing': '0.04rem',
        },
        '.text-sans-sm': {
          ...sansFamily,
          'font-size': '0.75rem',
          'letter-spacing': '0.04rem',
        },
        '.text-sans-md': {
          ...sansFamily,
          'font-size': '0.8125rem',
          'letter-spacing': '0.03rem',
        },
        '.text-sans-lg': {
          ...sansFamily,
          'font-size': '1rem',
          'letter-spacing': '0.02rem',
        },
        '.text-sans-semi-sm': {
          ...sansFamily,
          'font-size': '0.75rem',
          'letter-spacing': '0.02rem',
          'font-weight': 500,
        },
        '.text-sans-semi-md': {
          ...sansFamily,
          'font-size': '0.875rem',
          'letter-spacing': '0.02rem',
          'font-weight': 500,
        },
        '.text-sans-semi-lg': {
          ...sansFamily,
          'font-size': '1rem',
          'letter-spacing': '0.02rem',
          'font-weight': 500,
        },
      })
    }),
  ],
}
