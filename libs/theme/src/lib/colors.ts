type ColorNames = 'gray' | 'red' | 'yellow' | 'blue' | 'green'
type ColorValues = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
type Color = `${ColorNames}${ColorValues}`

export type Colors = Record<Color, string> & {
  white: string
  black: string
}
