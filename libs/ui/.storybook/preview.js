import React from 'react'
import { DocsContainer } from '@storybook/addon-docs/blocks'
import { ThemeProvider } from 'styled-components'
import { defaultTheme } from '../src/lib/theme'
import { colorPalette, GlobalStyle } from '@oxide/theme'

// FIXME: What background colors will be most valuable to designers? Presumably all the background colors used for each light/dark mode?
const getOptions = (colors) =>
  Object.keys(colors).map((key) => {
    return { name: key, value: colors[key] }
  })

// Global parameters
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  backgrounds: {
    // Change background color with this drop down of all available colors
    values: getOptions(colorPalette),
  },
  docs: {
    // Use an iframe for Docs page so stories have correct background color
    inlineStories: false,
    container: ({ children, context }) => (
      <DocsContainer context={context}>
        <ThemeProvider theme={defaultTheme}>{children}</ThemeProvider>
        <GlobalStyle />
      </DocsContainer>
    ),
  },
}

const withThemeProvider = (Story, context) => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <GlobalStyle />
      <Story {...context} />
    </ThemeProvider>
  )
}

export const decorators = [withThemeProvider]
