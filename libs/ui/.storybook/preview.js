import React from 'react'
// import { addDecorator } from '@storybook/react';
import { ThemeProvider } from 'styled-components'
import { colors, defaultTheme } from '../src/lib/theme'

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
}

export const decorators = [
  (Story) => (
    <ThemeProvider theme={defaultTheme}>
      <Story />
    </ThemeProvider>
  ),
]
