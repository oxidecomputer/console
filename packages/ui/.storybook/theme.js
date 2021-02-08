import { defaultTheme } from '@oxide/theme'
import { create } from '@storybook/theming'

export default create({
  base: 'dark',

  colorPrimary: defaultTheme.colors.mainText,
  colorSecondary: defaultTheme.colors.mainTextDimmed,

  // UI
  appBg: defaultTheme.colors.mainBg,

  brandTitle: 'Oxide - Console Storybook',
})
