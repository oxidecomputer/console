import React from 'react'
import { DocsContainer } from '@storybook/addon-docs/blocks'
import { ThemeProvider, createGlobalStyle } from 'styled-components'
import { colorPalette, defaultTheme } from '@oxide/theme'

// Temporary global style for <Avatar> stories until GlobalStyle PR is merged:
// https://github.com/oxidecomputer/console/pull/29/files
const TemporaryGlobalStyle = createGlobalStyle`
  html, body {
    font-size: 16px;
  }

  img {
    width: 100%;
    height: auto;
  }
`

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
        <TemporaryGlobalStyle />
        <ThemeProvider theme={defaultTheme}>{children}</ThemeProvider>
      </DocsContainer>
    ),
  },
}

export const decorators = [
  (Story) => (
    <ThemeProvider theme={defaultTheme}>
      <TemporaryGlobalStyle />
      <Story />
    </ThemeProvider>
  ),
]
