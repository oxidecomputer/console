import React from 'react'
import { DocsContainer } from '@storybook/addon-docs/blocks'
import { darkUI } from './theme'
import { ThemeProvider, createGlobalStyle } from 'styled-components'
import { useDarkMode } from 'storybook-dark-mode'
import { themes } from '@storybook/theming'
import { defaultTheme, GlobalStyle } from '@oxide/theme'
import { theme } from 'twin.macro'

// Bug: https://github.com/storybookjs/storybook/issues/14029
const DocsStyleOverrides = createGlobalStyle`
  h2.sbdocs, h3.sbdocs, h4.sbdocs, h5.sbdocs, h6.sbdocs, p.sbdocs {
    /* Use single direction margins only */
    margin: 1.25em 0 0 0 !important;
  }

  a, a:link {
    text-decoration: underline !important;
  }
`

const darkTheme = {
  ...themes.dark,
  appContentBg: theme`colors.gray.900`,
  textColor: theme`colors.green.50`,
}

const lightTheme = {
  ...themes.light,
  appContentBg: theme`colors.gray.50`,
  barBg: theme`colors.gray.100`,
}

const updateTheme = (context, dark) => {
  context.parameters.docs.theme = dark ? darkTheme : lightTheme
  return context
}

// Global Parameters
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  darkMode: {
    stylePreview: true,
  },
  docs: {
    container: ({ children, context }) => {
      const dark = useDarkMode()
      return (
        <DocsContainer context={updateTheme(context, dark)}>
          <ThemeProvider theme={defaultTheme}>
            <GlobalStyle />
            <DocsStyleOverrides />
            {children}
          </ThemeProvider>
        </DocsContainer>
      )
    },
    theme: darkUI,
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
