import { create } from '@storybook/theming'

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
  appBg: '#0B1418',
  appContentBg: '#0B1418',
  appBorderColor: '#30373B',
  appBorderRadius: 4,

  // Typography
  fontBase: '"Inter", "Open Sans", sans-serif',
})
