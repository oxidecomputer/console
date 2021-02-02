import { defaultTheme } from '@oxide/theme'
import { create } from '@storybook/theming'

export default create({
  base: 'dark',

  colorPrimary: defaultTheme.colors.primary,
  colorSecondary: defaultTheme.colors.secondary,

  // UI
  appBg: defaultTheme.colors.background,

  brandTitle: 'Oxide - Console Storybook',
})
