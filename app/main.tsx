import React from 'react'
import ReactDOM from 'react-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter as Router } from 'react-router-dom'

import { SkipLink } from '@oxide/ui'
import { ErrorBoundary } from './components/ErrorBoundary'
import { routes } from './routes'
import { ToastProvider } from './hooks'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 2000,
    },
  },
})

function render() {
  ReactDOM.render(
    <React.StrictMode>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <SkipLink id="skip-nav" />
            <Router>{routes}</Router>
          </ErrorBoundary>
        </QueryClientProvider>
      </ToastProvider>
    </React.StrictMode>,
    document.getElementById('root')
  )
}

if (process.env.NODE_ENV !== 'production' && process.env.MSW) {
  // MSW has NODE_ENV !== prod built into it, but let's be extra save
  // need to defer requests until after the mock server starts up
  Promise.all([import('@oxide/api-mocks'), import('msw')])
    .then(([{ handlers }, { setupWorker }]) => setupWorker(...handlers).start())
    .then(render)
} else {
  render()
}
