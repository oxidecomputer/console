import { Theme, ThemeColors } from './theme'

export const colors: ThemeColors = {
  white: 'hsl(0, 0%, 100%)',
  black: 'hsl(0, 0%, 0%)',

  gray50: 'hsl(0, 0%, 98%)',
  gray100: 'hsl(240, 5%, 96%)',
  gray200: 'hsl(240, 6%, 90%)',
  gray300: 'hsl(240, 5%, 84%)',
  gray400: 'hsl(240, 5%, 65%)',
  gray500: 'hsl(240, 4%, 46%)',
  gray600: 'hsl(240, 5%, 34%)',
  gray700: 'hsl(240, 5%, 26%)',
  gray800: 'hsl(240, 4%, 16%)',
  gray900: 'hsl(240, 6%, 10%)',

  green50: 'hsl(138, 76%, 97%)',
  green500: 'hsl(142, 71%, 45%)',
}

type BaseTheme = Omit<Theme, 'colors'>

const baseTheme: BaseTheme = {
  // TODO: Host these font files and use @font-face declarations in a global stylesheet
  fonts: {
    sans: `'Inter', sans-serif`,
    mono: `'GT America Mono', monospace`,
  },
  // Spacing is based on an 4px grid. Any spacing unit should be divisible by 4px. See: https://tailwindcss.com/docs/customizing-spacing#default-spacing-scale
  // Usage: `theme.spacing(4)` => '1rem' (16px)
  //
  // Dev Note: Eventually most commonly used numbers will map to strings e.g. `theme.spacing('small')`
  spacing: (size) => `${size * 0.25}rem`,
}

// TODO: Add colors for 'light mode'
// export const lightTheme: Theme = {
//   ...baseTheme,
//   colors: {}
// }

export const darkTheme: Theme = {
  ...baseTheme,
  colors: {
    mainBg: colors.gray900,
    mainText: colors.gray50,
    mainTextDimmed: colors.gray400,
  },
}

export const defaultTheme: Theme = darkTheme
