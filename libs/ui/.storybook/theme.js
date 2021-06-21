import { create } from '@storybook/theming'
import { theme } from 'twin.macro'

// Storybook Theme Options:
// https://github.com/storybookjs/storybook/blob/next/lib/theming/src/types.ts
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
  appBg: theme`colors.black`,
  appContentBg: theme`colors.black`,
  appBorderColor: theme`colors.gray.700`,
  appBorderRadius: 4,

  // Typography
  fontBase: '"Inter", "Open Sans", sans-serif',
})
