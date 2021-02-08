import { ThemeProvider } from 'styled-components'
import { defaultTheme } from '@oxide/theme'
import { colors, ThemeColors } from '@oxide/theme'

const values = (colors: ThemeColors) =>
  Object.keys(colors).map((key) => {
    return { name: key, value: colors[key] }
  })

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  backgrounds: {
    values: values(colors),
  },
}

export const decorators = [
  (Story) => (
    <ThemeProvider theme={defaultTheme}>
      <Story />
    </ThemeProvider>
  ),
]
