module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-nesting'),
    require('tailwindcss'),
    // use `npx autoprefixer --info` to see autoprefixer debug info
    require('autoprefixer'),
  ],
}
