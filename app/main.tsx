import React from 'react'
import ReactDOM from 'react-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter as Router, useRoutes } from 'react-router-dom'
import fileSystemRoutes from 'virtual:remix-routes'
import { EagerLoader } from 'vite-plugin-remix-routes/client'

import { SkipLink } from '@oxide/ui'
import { ErrorBoundary } from './components/ErrorBoundary'
// import { routes } from './routes'
import { QuickActions, ToastProvider } from './hooks'

console.log(fileSystemRoutes)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 2000,
      networkMode: 'offlineFirst',
    },
  },
})

function Routes() {
  const elements = useRoutes(fileSystemRoutes)

  return (
    <>
      <EagerLoader routes={fileSystemRoutes} />
      {elements}
    </>
  )
}

function render() {
  ReactDOM.render(
    <React.StrictMode>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <QuickActions />
            <SkipLink id="skip-nav" />
            <Router>
              <Routes />
            </Router>
          </ErrorBoundary>
        </QueryClientProvider>
      </ToastProvider>
    </React.StrictMode>,
    document.getElementById('root')
  )
}

// stripped out by rollup in production
async function startMockAPI() {
  const { handlers } = await import('@oxide/api-mocks')
  const { setupWorker } = await import('msw')
  const { default: workerUrl } = await import('./mockServiceWorker.js?url')
  await setupWorker(...handlers).start({
    serviceWorker: {
      url: workerUrl,
    },
  })
}

if (process.env.NODE_ENV !== 'production' && process.env.MSW) {
  // MSW has NODE_ENV !== prod built into it, but let's be extra safe
  // need to defer requests until after the mock server starts up
  startMockAPI().then(render)
} else {
  render()
}
