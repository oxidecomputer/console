import React from 'react'
import { DocsContainer } from '@storybook/addon-docs/blocks'
import { ThemeProvider } from 'styled-components'
import { colors, defaultTheme, GlobalStyle } from '../src/lib/theme'

// FIXME: What background colors will be most valuable to designers? Presumably all the background colors used for each light/dark mode?
const values = (colors) =>
  Object.keys(colors).map((key) => {
    return { name: key, value: colors[key] }
  })

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  backgrounds: {
    values: values(colors),
  },
  docs: {
    container: ({ children, context }) => (
      <DocsContainer context={context}>
        <ThemeProvider theme={defaultTheme}>{children}</ThemeProvider>
        <GlobalStyle />
      </DocsContainer>
    ),
  },
}

export const decorators = [
  (Story) => (
    <ThemeProvider theme={defaultTheme}>
      <Story />
      <GlobalStyle />
    </ThemeProvider>
  ),
]
