export interface ThemeColors {
  white: string
  black: string

  gray50: string
  gray100: string
  gray200: string
  gray300: string
  gray400: string
  gray500: string
  gray600: string
  gray700: string
  gray800: string
  gray900: string

  red50: string
  red100: string
  red200: string
  red300: string
  red400: string
  red500: string
  red600: string
  red700: string
  red800: string
  red900: string

  yellow50: string
  yellow100: string
  yellow200: string
  yellow300: string
  yellow400: string
  yellow500: string
  yellow600: string
  yellow700: string
  yellow800: string
  yellow900: string

  blue50: string
  blue100: string
  blue200: string
  blue300: string
  blue400: string
  blue500: string
  blue600: string
  blue700: string
  blue800: string
  blue900: string

  green50: string
  green100: string
  green200: string
  green300: string
  green400: string
  green500: string
  green600: string
  green700: string
  green800: string
  green900: string
}

type SizingMultiplier =
  | 0.5
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 16
  | 20
  | 24
  | 32
  | 40
  | 48
  | 56
  | 64

export interface Theme {
  colors: {
    // TODO: Figure out better names
    mainBg: string
    mainText: string
    mainTextDimmed: string
  }
  fonts: {
    sans: string
    mono: string
  }
  spacing: (size: SizingMultiplier) => void
}

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

  red50: '#fdf8f9',
  red100: '#fbf1f3',
  red200: '#f5dbe1',
  red300: '#efc6cf',
  red400: '#e49bab',
  red500: '#D87087',
  red600: '#c2657a',
  red700: '#a25465',
  red800: '#824351',
  red900: '#6a3742',

  yellow50: '#fefdf8',
  yellow100: '#fdfaf1',
  yellow200: '#fbf4dd',
  yellow300: '#f9edc8',
  yellow400: '#f4df9f',
  yellow500: '#EFD176',
  yellow600: '#d7bc6a',
  yellow700: '#b39d59',
  yellow800: '#8f7d47',
  yellow900: '#75663a',

  blue50: '#f9f9fe',
  blue100: '#f2f4fe',
  blue200: '#dfe3fc',
  blue300: '#cbd2fa',
  blue400: '#a4b1f6',
  blue500: '#7D8FF2',
  blue600: '#7181da',
  blue700: '#5e6bb6',
  blue800: '#4b5691',
  blue900: '#3d4677',

  green50: '#f8fdfa',
  green100: '#f1fbf5',
  green200: '#dcf4e6',
  green300: '#c7edd7',
  green400: '#9de0ba',
  green500: '#73D29C',
  green600: '#68bd8c',
  green700: '#569e75',
  green800: '#457e5e',
  green900: '#38674c',
}

type BaseTheme = Omit<Theme, 'colors'>

const baseTheme: BaseTheme = {
  // TODO: Host these font files and use @font-face declarations in a global stylesheet
  fonts: {
    sans: `'Inter', sans-serif`,
    mono: `'GT America Mono', monospace`,
  },

  // Spacing is based on Tailwind's default spacing scale. See: https://tailwindcss.com/docs/customizing-spacing#default-spacing-scale
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
