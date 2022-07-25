import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom'

import { SkipLink } from '@oxide/ui'

import { ErrorBoundary } from './components/ErrorBoundary'
import { QuickActions, ReduceMotion, ToastProvider } from './hooks'
// stripped out by rollup in production
import { startMockAPI } from './msw-mock-api'
import { Router } from './routes'

if (process.env.SHA) {
  console.info(
    'Oxide Web Console version',
    `https://github.com/oxidecomputer/console/commits/${process.env.SHA}`
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 2000,
      networkMode: 'offlineFirst',
    },
  },
})

function render() {
  ReactDOM.render(
    <StrictMode>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <QuickActions />
            <SkipLink id="skip-nav" />
            <ReduceMotion />
            <Router />
          </ErrorBoundary>
        </QueryClientProvider>
      </ToastProvider>
    </StrictMode>,
    document.getElementById('root')
  )
}

if (process.env.NODE_ENV !== 'production' && process.env.MSW) {
  // MSW has NODE_ENV !== prod built into it, but let's be extra safe
  // need to defer requests until after the mock server starts up
  startMockAPI().then(render)
} else {
  render()
}
