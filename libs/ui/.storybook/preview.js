import React from 'react'
import { DocsContainer } from '@storybook/addon-docs/blocks'
import { ThemeProvider } from 'styled-components'
import { colors, defaultTheme, GlobalStyle } from '../src/lib/theme'

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
    values: getOptions(colors),
  },
  docs: {
    // Use an iframe for Docs page so stories have correct background color
    inlineStories: false,
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

const withThemeProvider = (Story, context) => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <React.Fragment>
        <GlobalStyle />
        <Story {...context} />
      </React.Fragment>
    </ThemeProvider>
  )
}

export const decorators = [withThemeProvider]
