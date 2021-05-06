import React from 'react'
import ReactDOM from 'react-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { GlobalStyle } from '@oxide/ui'

import App from './app/app'
import { ToastProvider } from './contexts'

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
    <GlobalStyle />
    <ToastProvider>
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ToastProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
