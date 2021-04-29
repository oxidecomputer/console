export const colorGroups = [
  'gray',
  'red',
  'yellow',
  'blue',
  'darkBlue',
  'green',
  'darkGreen',
  'purple',
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
