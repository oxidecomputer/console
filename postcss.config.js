/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

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
    // use `npx autoprefixer --info` to see autoprefixer debug info
    require('autoprefixer'),
    ...ladlePlugins,
  ],
}
