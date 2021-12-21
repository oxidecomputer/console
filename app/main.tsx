import React from 'react'
import ReactDOM from 'react-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter as Router } from 'react-router-dom'

import { SkipLink } from '@oxide/ui'
import { ErrorBoundary } from './components/ErrorBoundary'
import { UserProvider } from './components/UserProvider'
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

ReactDOM.render(
  <React.StrictMode>
    <ToastProvider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <UserProvider>
            <SkipLink id="skip-nav" />
            <Router>{routes}</Router>
          </UserProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </ToastProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
