import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { DocsContainer } from '@storybook/addon-docs'
import { darkUI } from './theme'
import '../styles/index.css'
import './docs-style-overrides.css'

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
