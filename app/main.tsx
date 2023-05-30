import { QueryClientProvider } from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import { queryClient } from '@oxide/api'
import { SkipLink } from '@oxide/ui'

import { ErrorBoundary } from './components/ErrorBoundary'
import { QuickActions, ReduceMotion } from './hooks'
// stripped out by rollup in production
import { startMockAPI } from './msw-mock-api'
import { routes } from './routes'

if (process.env.SHA) {
  console.info(
    'Oxide Web Console version',
    `https://github.com/oxidecomputer/console/commits/${process.env.SHA}`
  )
}

const root = createRoot(document.getElementById('root')!)

function render() {
  // createBrowserRouter kicks off the loaders, which is weird because you'd
  // think route matching hasn't happened yet, but apparently it does its own
  // matching. I asked about this on Discord and they said it's intentional.
  // This means RR is best thought of as an external store that runs
  // independently of the React render lifecycle.
  const router = createBrowserRouter(routes, {
    // https://reactrouter.com/en/main/guides/api-development-strategy#current-future-flags
    future: { v7_normalizeFormMethod: true },
  })

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <QuickActions />
          <SkipLink id="skip-nav" />
          <ReduceMotion />
          <RouterProvider router={router} />
        </ErrorBoundary>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </StrictMode>
  )
}

if (process.env.NODE_ENV !== 'production' && process.env.MSW) {
  // MSW has NODE_ENV !== prod built into it, but let's be extra safe
  // need to defer requests until after the mock server starts up
  startMockAPI().then(render)
} else {
  render()
}
