import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { DocsContainer } from '@storybook/addon-docs/blocks'
import { darkUI } from './theme'
import { createGlobalStyle } from 'styled-components'
import { GlobalStyle } from '@oxide/theme'
import { breakpoints, colorPalette } from '@oxide/css-helpers'

// Bug: https://github.com/storybookjs/storybook/issues/14029
const DocsStyleOverrides = createGlobalStyle`
  table.sbdocs tr {
    background-color: inherit;
    color: inherit;
  }

  table.sbdocs tr:nth-of-type(2n) {
    background-color: inherit;
    color: inherit;
  }

  .sbdocs-wrapper {
    padding-top: 1.5rem;
  }

  h1.sbdocs, h2.sbdocs, h3.sbdocs, h4.sbdocs, h5.sbdocs, h6.sbdocs, p.sbdocs {
    /* Use single direction margins only */
    margin: 1.25em 0 0 0 !important;
  }

  a, a:link {
    text-decoration: underline !important;
  }

  /* Allow dropdown to 'break out' of its container */
  .sbdocs-preview {
    overflow: visible;
  }
  .docs-story {
    overflow: visible;
  }
  .docs-story > div {
    overflow: visible;
  }
`

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
        <GlobalStyle />
        <DocsStyleOverrides />
        <Router>{children}</Router>
      </DocsContainer>
    ),
    theme: darkUI,
  },
  options: {
    storySort: { method: 'alphabetical' },
  },
  viewport: {
    viewports: Object.keys(breakpoints).reduce(
      (obj, breakpoint) => ({
        ...obj,
        [breakpoint]: {
          name: `${breakpoint} Breakpoint`,
          styles: {
            width: `${breakpoints[breakpoint]}px`,
            height: '850px',
          },
        },
      }),
      {}
    ),
  },
}

export const decorators = [
  (Story) => (
    <>
      <GlobalStyle />
      <Router>
        <Story />
      </Router>
    </>
  ),
]
