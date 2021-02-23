import { create } from '@storybook/theming'
import { colorPalette } from '@oxide/theme'

export default create({
  brandTitle: 'Oxide - Console Storybook',
  brandUrl: 'https://console-ui-storybook.vercel.app/',

  // Typography
  fontBase: '"Inter", "Open Sans", sans-serif',
})

export const darkUI = create({
  base: 'dark',
  brandTitle: 'Oxide - Console Storybook',
  brandUrl: 'https://console-ui-storybook.vercel.app/',

  // UI
  appBg: colorPalette.gray900,
  appContentBg: colorPalette.gray900,
  appBorderColor: colorPalette.gray700,
  appBorderRadius: 4,

  // Typography
  fontBase: '"Inter", "Open Sans", sans-serif',
})
