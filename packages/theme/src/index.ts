import { Theme, ThemeColors } from './theme'

const colors: ThemeColors = {
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

export const defaultTheme: Theme = {
  colors: colors,
  spacing: (size) => `${size * 0.4}rem`,
}
