import React from 'react'
import { DocsContainer } from '@storybook/addon-docs/blocks'
import { ThemeProvider } from 'styled-components'
import { colorPalette, defaultTheme } from '@oxide/theme'
import { jsxDecorator } from 'storybook-addon-jsx'

// FIXME: What background colors will be most valuable to designers? Presumably all the background colors used for each light/dark mode?
const values = (colors) =>
  Object.keys(colors).map((key) => {
    return { name: key, value: colors[key] }
  })

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  backgrounds: {
    values: values(colorPalette),
  },
  docs: {
    container: ({ children, context }) => (
      <DocsContainer context={context}>
        <ThemeProvider theme={defaultTheme}>{children}</ThemeProvider>
      </DocsContainer>
    ),
  },
}

export const decorators = [
  jsxDecorator,
  (Story) => (
    <ThemeProvider theme={defaultTheme}>
      <Story />
    </ThemeProvider>
  ),
]
