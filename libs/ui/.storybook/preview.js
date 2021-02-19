import React from 'react'
import { DocsContainer } from '@storybook/addon-docs/blocks'
import { ThemeProvider } from 'styled-components'
import { colorPalette, defaultTheme, GlobalStyle } from '@oxide/theme'

const getBackgroundColors = (colors) =>
  Object.keys(colors).map((key) => {
    return { name: key, value: colors[key] }
  })

// Global Parameters
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  backgrounds: {
    // Bug: background selector is broken for stories written in MDX
    // See: https://github.com/storybookjs/storybook/issues/7978#issuecomment-726797915
    default: 'gray900',
    // Add background color selector with these color options
    values: getBackgroundColors(colorPalette),
  },
  docs: {
    // Default background does not apply to docs
    container: ({ children, context }) => (
      <DocsContainer context={context}>
        <ThemeProvider theme={defaultTheme}>
          <GlobalStyle />
          {children}
        </ThemeProvider>
      </DocsContainer>
    ),
  },
}

export const decorators = [
  (Story) => (
    <ThemeProvider theme={defaultTheme}>
      <GlobalStyle />
      <Story />
    </ThemeProvider>
  ),
]
