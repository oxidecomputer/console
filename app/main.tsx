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

// When running E2E tests we want to allow MSW for validation tests (which set MSW in the user agent)
if (process.env.MSW || (process.env.E2E && window.navigator.userAgent.endsWith('MSW'))) {
  startMockAPI().then(render)
} else {
  render()
}
