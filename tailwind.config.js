// @ts-check

/** @type {import('tailwindcss/lib/util/createPlugin').default} */
// @ts-ignore
const plugin = require('tailwindcss/plugin')
const defaultConfig = require('tailwindcss/defaultConfig')

const childrenPlugin = require('tailwindcss-children')

/** @type {import('tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
  mode: 'jit',
  purge: ['./libs/ui/**/*.{ts,tsx,mdx}', './app/**/*.{ts,tsx}'],
  darkMode: false,
  theme: {
    extend: {
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
      black: '#0B1418',
      white: '#FFFFFF',
      gray: {
        50: '#E7E7E8',
        100: '#AAAFB1',
        200: '#969A9C',
        300: '#646A6D',
        400: '#30373B',
        500: '#192125',
        550: '#131B1F',
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
    // imitation of the twin.macro svg: variant. svg:text-green-500 puts green
    // on an SVG that's an immediate child of the element
    plugin(function ({ addVariant, e }) {
      addVariant('svg', ({ modifySelectors, separator }) => {
        modifySelectors(
          ({ className }) => `.${e(`svg${separator}${className}`)} > svg`
        )
      })
    }),
    childrenPlugin,
  ],
  /**
   * TODO: This isn't respected, need an upstream fix.
   * @see https://github.com/tailwindlabs/tailwindcss/issues/3949
   */
  variantOrder: ['children', ...defaultConfig.variantOrder, 'svg'],
}
