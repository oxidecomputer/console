import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom'

import { queryClient } from '@oxide/api'
import { SkipLink } from '@oxide/ui'

import { ErrorBoundary } from './components/ErrorBoundary'
import { QuickActions, ReduceMotion } from './hooks'
import { ToastStack } from './hooks/use-toast/ToastStack'
// stripped out by rollup in production
import { startMockAPI } from './msw-mock-api'
import { Router } from './routes'

if (process.env.SHA) {
  console.info(
    'Oxide Web Console version',
    `https://github.com/oxidecomputer/console/commits/${process.env.SHA}`
  )
}

function render() {
  ReactDOM.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <QuickActions />
          <SkipLink id="skip-nav" />
          <ReduceMotion />
          <Router />
        </ErrorBoundary>
      </QueryClientProvider>
      <ToastStack />
    </StrictMode>,
    document.getElementById('root')
  )
}

/**
 * The `MSW` prefix to the user agent comes from our playwright config.
 * Currently it's not possible to provide different environment variables
 * via test configuration so this method is used to differentiate between
 * smoke tests that don't need MSW and validation tests that do.
 */
if (
  process.env.NODE_ENV !== 'production' &&
  (process.env.MSW || window.navigator.userAgent.endsWith('MSW'))
) {
  // MSW has NODE_ENV !== prod built into it, but let's be extra safe
  // need to defer requests until after the mock server starts up
  startMockAPI().then(render)
} else {
  render()
}
