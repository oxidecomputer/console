// @ts-check

/** @type {import('tailwindcss/lib/util/createPlugin').default} */
// @ts-ignore
const plugin = require('tailwindcss/plugin')
const {
  textUtilities,
  colorUtilities,
  borderRadiusTokens,
  elevationUtilities,
} = require('@oxide/design-system/styles/dist/tailwind-tokens')

/** @type {import('tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
  corePlugins: {
    fontFamily: false,
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
    },
    borderRadius: {
      none: 0,
      ...borderRadiusTokens,
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
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
      addUtilities({
        '.appearance-textfield': {
          appearance: 'textfield',
        },
      })
      addUtilities(elevationUtilities)
    }),
  ],
}
