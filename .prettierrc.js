/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *  
 * Copyright Oxide Computer Company
 */

const twPlugin = require('prettier-plugin-tailwindcss')
const importsPlugin = require('@trivago/prettier-plugin-sort-imports')

// The Tailwind plugin and the imports plugin can't both be used at the same
// time because they both rely on the same underlying mechanism, which can only
// take one plugin. So we manually combine them into a single plugin and use
// that. Approach recommended here:
// https://github.com/tailwindlabs/prettier-plugin-tailwindcss/issues/31#issuecomment-1195411734

/** @type {import("prettier").Parser}  */
const combinedParser = {
  ...importsPlugin.parsers.typescript,
  parse: twPlugin.parsers.typescript.parse,
}

/** @type {import("prettier").Plugin}  */
const combinedPlugin = {
  parsers: {
    typescript: combinedParser,
  },
}

module.exports = {
  plugins: [combinedPlugin],
  printWidth: 92,
  singleQuote: true,
  semi: false,
  importOrder: ['<THIRD_PARTY_MODULES>', '^@oxide/(.*)$', '^app/(.*)$', '^[./]'],
  importOrderGroupNamespaceSpecifiers: true,
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}
