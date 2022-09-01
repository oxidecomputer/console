let ladlePlugins = []
if (process.env.IS_LADLE) {
  // used by checkbox stories to show states
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
    // use `npx autoprefixer --info` to see autoprefixer debug info
    require('autoprefixer'),
    ...ladlePlugins,
  ],
}
