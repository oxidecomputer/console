// @ts-check

/** @type {import('tailwindcss/lib/util/createPlugin').default} */
// @ts-ignore
const plugin = require('tailwindcss/plugin')
const defaultConfig = require('tailwindcss/defaultConfig')

const childrenPlugin = require('tailwindcss-children')

/** @type {import('tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
  content: ['./libs/ui/**/*.{ts,tsx,mdx}', './app/**/*.{ts,tsx}'],
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
    // imitation of the twin.macro svg: variant. svg:text-green-500 puts green
    // on an SVG that's an immediate child of the element
    plugin(({ addVariant }) => addVariant('svg', '& > svg')),
    childrenPlugin,
  ],
  /**
   * TODO: This isn't respected, need an upstream fix.
   * @see https://github.com/tailwindlabs/tailwindcss/issues/3949
   */
  variantOrder: ['children', ...defaultConfig.variantOrder, 'svg'],
}
