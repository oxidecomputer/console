import { DocsContainer } from '@storybook/addon-docs'
import { BrowserRouter as Router } from 'react-router-dom'

import '../styles/index.css'
import './docs-style-overrides.css'
import { darkUI } from './theme'

// Global Parameters
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  docs: {
    // Default background does not apply to docs
    container: ({ children, context }) => (
      <DocsContainer context={context}>{children}</DocsContainer>
    ),
    theme: darkUI,
  },
  options: {
    storySort: { method: 'alphabetical' },
  },
}

export const decorators = [
  (Story) => (
    <Router>
      <Story />
    </Router>
  ),
]
