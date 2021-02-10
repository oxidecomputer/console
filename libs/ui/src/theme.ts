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

  red50: 'hsl(348, 56%, 98%)',
  red100: 'hsl(348, 56%, 96%)',
  red200: 'hsl(346, 57%, 91%)',
  red300: 'hsl(347, 56%, 86%)',
  red400: 'hsl(347, 57%, 75%)',
  red500: 'hsl(347, 57%, 64%)',
  red600: 'hsl(346, 43%, 58%)',
  red700: 'hsl(347, 32%, 48%)',
  red800: 'hsl(347, 32%, 39%)',
  red900: 'hsl(347, 32%, 32%)',

  yellow50: 'hsl(50, 75%, 98%)',
  yellow100: 'hsl(45, 75%, 97%)',
  yellow200: 'hsl(46, 79%, 93%)',
  yellow300: 'hsl(45, 80%, 88%)',
  yellow400: 'hsl(45, 79%, 79%)',
  yellow500: 'hsl(45, 79%, 70%)',
  yellow600: 'hsl(45, 58%, 63%)',
  yellow700: 'hsl(45, 37%, 53%)',
  yellow800: 'hsl(45, 34%, 42%)',
  yellow900: 'hsl(45, 34%, 34%)',

  blue50: 'hsl(240, 71%, 99%)',
  blue100: 'hsl(230, 86%, 97%)',
  blue200: 'hsl(232, 83%, 93%)',
  blue300: 'hsl(231, 82%, 89%)',
  blue400: 'hsl(230, 82%, 80%)',
  blue500: 'hsl(231, 82%, 72%)',
  blue600: 'hsl(231, 59%, 65%)',
  blue700: 'hsl(231, 38%, 54%)',
  blue800: 'hsl(231, 32%, 43%)',
  blue900: 'hsl(231, 32%, 35%)',

  green50: 'hsl(144, 56%, 98%)',
  green100: 'hsl(144, 56%, 96%)',
  green200: 'hsl(145, 52%, 91%)',
  green300: 'hsl(145, 51%, 85%)',
  green400: 'hsl(146, 52%, 75%)',
  green500: 'hsl(146, 51%, 64%)',
  green600: 'hsl(145, 39%, 57%)',
  green700: 'hsl(146, 30%, 48%)',
  green800: 'hsl(146, 29%, 38%)',
  green900: 'hsl(146, 30%, 31%)',
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
