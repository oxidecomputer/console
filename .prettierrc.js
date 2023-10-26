/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

module.exports = {
  // note: it seems like tailwind has to be last for it to work
  plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
  printWidth: 92,
  singleQuote: true,
  semi: false,
  trailingComma: 'es5', // default changed to all in prettier 3, wanted to minimize diff
  importOrder: ['<THIRD_PARTY_MODULES>', '^@oxide/(.*)$', '^app/(.*)$', '^[./]'],
  importOrderGroupNamespaceSpecifiers: true,
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}
