/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { type Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

import {
  borderRadiusTokens,
  colorUtilities,
  elevationUtilities,
  textUtilities,
} from '@oxide/design-system/styles/dist/tailwind-tokens.ts'

module.exports = {
  corePlugins: {
    fontFamily: false,
    fontSize: false,
  },
  content: ['./app/**/*.{ts,tsx}'],
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
      zIndex: {
        toast: '50',
        modalDropdown: '50',
        modal: '40',
        sideModalDropdown: '40',
        sideModal: '30',
        modalOverlay: '25',
        topBarDropdown: '20',
        topBar: '15',
        popover: '10',
        contentDropdown: '10',
        content: '0',
      },
    },
    borderRadius: {
      none: '0',
      ...borderRadiusTokens,
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
    },
  },
  plugins: [
    plugin(({ addVariant, addUtilities }) => {
      addVariant('children', '& > *')
      addVariant('selected', '.is-selected &')
      addVariant('disabled', ['&.visually-disabled', '&:disabled'])
      addUtilities(
        Array.from({ length: 12 }, (_, i) => i)
          .map((i) => ({
            [`.grid-col-${i}`]: {
              'grid-column': `${i}`,
            },
          }))
          .reduce((p, c) => ({ ...p, ...c }), {}),
      )
      addUtilities(textUtilities)
      addUtilities(colorUtilities)
      addUtilities(elevationUtilities)
    }),
  ],
} satisfies Config
