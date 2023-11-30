/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

let ladlePlugins = {}
if (process.env.IS_LADLE) {
  // used by checkbox and radio stories to show states
  ladlePlugins = {
    'postcss-pseudo-classes': {
      restrictTo: ['hover', 'disabled', 'active', 'focus', 'focus-visible'],
    },
  }
}

export default {
  plugins: {
    'postcss-import': {},
    // https://tailwindcss.com/docs/using-with-preprocessors#nesting
    'tailwindcss/nesting': 'postcss-nesting',
    tailwindcss: {},
    autoprefixer: {},
    ...ladlePlugins,
  },
}
