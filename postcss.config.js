module.exports = {
  plugins: [
    require('postcss-import'),
    // https://github.com/tailwindlabs/tailwindcss/tree/master/nesting
    require('tailwindcss/nesting')(require('postcss-nesting')),
    require('tailwindcss'),
    // use `npx autoprefixer --info` to see autoprefixer debug info
    require('autoprefixer'),
  ],
}
