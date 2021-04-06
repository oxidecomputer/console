// Colors
export const colorGroups = [
  'gray',
  'red',
  'yellow',
  'blue',
  'darkBlue',
  'green',
  'darkGreen',
] as const
export type ColorGroup = typeof colorGroups[number]
export const colorValues = [
  50,
  100,
  200,
  300,
  400,
  500,
  600,
  700,
  800,
  900,
] as const
export type ColorValues = typeof colorValues[number]
type MainColor = `${ColorGroup}${ColorValues}`

export const bgColors = ['purple', 'yellow', 'green', 'blue', 'red'] as const
type BGColor = `darkBg${Capitalize<typeof bgColors[number]>}`

type WhiteBlack = 'white' | 'black'

export type Color = MainColor | BGColor | WhiteBlack
export type ColorPalette = Record<Color, string>

export const colorDefinitions: ColorPalette = {
  white: '0, 0%, 100%',
  black: '0, 0%, 0%',

  gray50: '0, 0%, 98%',
  gray100: '240, 5%, 96%',
  gray200: '240, 6%, 90%',
  gray300: '240, 5%, 84%',
  gray400: '240, 5%, 65%',
  gray500: '240, 4%, 46%',
  gray600: '240, 5%, 34%',
  gray700: '240, 5%, 26%',
  gray800: '240, 4%, 16%',
  gray900: '240, 6%, 10%',

  red50: '348, 56%, 98%',
  red100: '348, 56%, 96%',
  red200: '346, 57%, 91%',
  red300: '347, 56%, 86%',
  red400: '347, 57%, 75%',
  red500: '347, 57%, 64%',
  red600: '346, 43%, 58%',
  red700: '347, 32%, 48%',
  red800: '347, 32%, 39%',
  red900: '347, 32%, 32%',

  yellow50: '50, 75%, 98%',
  yellow100: '45, 75%, 97%',
  yellow200: '46, 79%, 93%',
  yellow300: '45, 80%, 88%',
  yellow400: '45, 79%, 79%',
  yellow500: '45, 79%, 70%',
  yellow600: '45, 58%, 63%',
  yellow700: '45, 37%, 53%',
  yellow800: '45, 34%, 42%',
  yellow900: '45, 34%, 34%',

  blue50: '240, 71%, 99%',
  blue100: '230, 86%, 97%',
  blue200: '232, 83%, 93%',
  blue300: '231, 82%, 89%',
  blue400: '230, 82%, 80%',
  blue500: '231, 82%, 72%',
  blue600: '231, 59%, 65%',
  blue700: '231, 38%, 54%',
  blue800: '231, 32%, 43%',
  blue900: '231, 32%, 35%',

  darkBlue50: '0, 0%, 100%',
  darkBlue100: '0, 0%, 100%',
  darkBlue200: '0, 0%, 100%',
  darkBlue300: '0, 0%, 100%',
  darkBlue400: '0, 0%, 100%',
  darkBlue500: '0, 0%, 100%',
  darkBlue600: '0, 0%, 100%',
  darkBlue700: '0, 0%, 100%',
  darkBlue800: '203, 12%, 13%',
  darkBlue900: '198, 26%, 7%',

  green50: '154, 64%, 98%',
  green100: '154, 64%, 96%',
  green200: '153, 64%, 89%',
  green300: '153, 62%, 82%',
  green400: '153, 63%, 69%',
  green500: '154, 63%, 56%',
  green600: '154, 50%, 50%',
  green700: '153, 50%, 42%',
  green800: '154, 50%, 34%',
  green900: '154, 50%, 27%',

  darkGreen50: '0, 0%, 100%',
  darkGreen100: '0, 0%, 100%',
  darkGreen200: '0, 0%, 100%',
  darkGreen300: '0, 0%, 100%',
  darkGreen400: '0, 0%, 100%',
  darkGreen500: '0, 0%, 100%',
  darkGreen600: '0, 0%, 100%',
  darkGreen700: '0, 0%, 100%',
  darkGreen800: '163, 37%, 15%',
  darkGreen900: '176, 23%, 12%',

  darkBgPurple: '255, 30%, 18%',
  darkBgYellow: '65, 13%, 18%',
  darkBgGreen: '163, 37%, 15%',
  darkBgBlue: '220, 30%, 18%',
  darkBgRed: '330, 12%, 16%',
}

export const colorNames = Object.keys(colorDefinitions) as Color[]
export const colorPalette: ColorPalette = colorNames.reduce((palette, name) => {
  return { ...palette, [name]: `hsl(${colorDefinitions[name]})` }
}, {} as ColorPalette)
