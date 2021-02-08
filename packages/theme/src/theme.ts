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

  green50: string
  green500: string
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
