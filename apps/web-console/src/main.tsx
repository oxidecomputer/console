import React from 'react'
import ReactDOM from 'react-dom'
import { ThemeProvider } from 'styled-components'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { GlobalStyle, defaultTheme } from '@oxide/theme'

import App from './app/app'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={defaultTheme}>
      <GlobalStyle />
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
