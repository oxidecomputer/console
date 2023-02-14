const postcssGlobalData = require('@csstools/postcss-global-data')

let ladlePlugins = []
if (process.env.IS_LADLE) {
  // used by checkbox and radio stories to show states
  ladlePlugins.push(
    require('postcss-pseudo-classes')({
      restrictTo: ['hover', 'disabled', 'active', 'focus', 'focus-visible'],
    })
  )
}

module.exports = {
  plugins: [
    require('postcss-import'),
    // https://github.com/tailwindlabs/tailwindcss/tree/master/nesting
    require('tailwindcss/nesting')(require('postcss-nesting')),
    require('tailwindcss'),
    postcssGlobalData({
      files: ['node_modules/@oxide/design-system/styles/dist/main.css'],
    }),
    require('postcss-custom-properties'),
    require('./postcss/postcss-wide-gamut-color'),
    // use `npx autoprefixer --info` to see autoprefixer debug info
    require('autoprefixer'),
    ...ladlePlugins,
  ],
}
