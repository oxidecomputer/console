type ColorNames = 'gray' | 'red' | 'yellow' | 'blue' | 'green'
type ColorValues = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900

export type Color = `${ColorNames}${ColorValues}` | 'white' | 'black'
export type ColorPalette = Record<Color, string>

export const colorPalette: ColorPalette = {
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
