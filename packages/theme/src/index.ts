import { Theme, ThemeColors } from './theme'

export const colors: ThemeColors = {
  white: '#FFFFFF',
  black: '#000000',

  gray50: '#FAFAFA',
  gray100: '#F4F4F5',
  gray200: '#E4E4E7',
  gray300: '#D4D4D8',
  gray400: '#A1A1AA',
  gray500: '#71717A',
  gray600: '#52525B',
  gray700: '#3F3F46',
  gray800: '#27272A',
  gray900: '#18181B',

  green50: '#F0FDF4',
  green500: '#22C55E',
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
