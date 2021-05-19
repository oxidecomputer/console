import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { DocsContainer } from '@storybook/addon-docs/blocks'
import { darkUI } from './theme'
import { Global, css } from '@emotion/react'
import { GlobalStyle } from '@oxide/ui'

// Bug: https://github.com/storybookjs/storybook/issues/14029
const docsStyleOverrides = css`
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

  h1.sbdocs,
  h2.sbdocs,
  h3.sbdocs,
  h4.sbdocs,
  h5.sbdocs,
  h6.sbdocs,
  p.sbdocs {
    /* Use single direction margins only */
    margin: 1.25em 0 0 0 !important;
  }

  a,
  a:link {
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

// Global Parameters
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  docs: {
    // Default background does not apply to docs
    container: ({ children, context }) => (
      <DocsContainer context={context}>
        <GlobalStyle />
        <Global styles={docsStyleOverrides} />
        <Router>{children}</Router>
      </DocsContainer>
    ),
    theme: darkUI,
  },
  options: {
    storySort: { method: 'alphabetical' },
  },
}

// inserting the global style only in story mode is essential. otherwise, on
// docs pages that might render 50 stories, we are inserting the entire global
// style for every story instead of relying on the one copy we put in
// DocsContainer above. The workaround prior to this fix was running Storybook
// in production mode, which made debugging very difficult.
export const decorators = [
  (Story, context) => (
    <>
      {context.viewMode === 'story' && <GlobalStyle />}
      <Router>
        <Story />
      </Router>
    </>
  ),
]
