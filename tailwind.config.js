// @ts-check

/** @type {import('tailwindcss/lib/util/createPlugin').default} */
// @ts-ignore
const plugin = require('tailwindcss/plugin')
const {
  textUtilities,
  colorUtilities,
} = require('./libs/ui/styles/themes/tailwind-tokens')

/** @type {import('tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
  corePlugins: {
    fontSize: false,
  },
  content: ['./libs/**/*.{ts,tsx,mdx}', './app/**/*.{ts,tsx}'],
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
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: 'var(--base-black-700)',
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
        500: 'var(--base-red-500)',
        600: '#BC5770',
        700: '#8F465A',
        800: '#643644',
        900: '#37252E',
        950: '#211C23',
      },
      yellow: {
        500: 'var(--base-yellow-500)',
        600: '#C6AA56',
        700: '#978447',
        800: '#695F36',
        900: '#3A3927',
        950: '#222720',
      },
      blue: {
        500: 'var(--base-blue-500)',
        600: '#3C58CA',
        700: '#30479E',
        800: '#243670',
        900: '#182544',
        950: '#111C2F',
      },
      green: {
        500: 'var(--base-green-500)',
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
      addVariant('selected', '.is-selected &')
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
      addUtilities(textUtilities)
      addUtilities(colorUtilities)
    }),
  ],
}
