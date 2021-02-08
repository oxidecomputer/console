export interface ThemeColors {
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

export interface Theme {
  colors: ThemeColors
  spacing: (
    size:
      | 1
      | 2
      | 3
      | 4
      | 5
      | 6
      | 8
      | 10
      | 12
      | 16
      | 20
      | 24
      | 32
      | 40
      | 48
      | 56
      | 64
  ) => void
}
