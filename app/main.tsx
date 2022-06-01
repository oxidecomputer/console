import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { QueryClient, QueryClientProvider } from 'react-query'

import { SkipLink } from '@oxide/ui'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Router } from './routes'
import { QuickActions, ToastProvider } from './hooks'

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
            <Router />
          </ErrorBoundary>
        </QueryClientProvider>
      </ToastProvider>
    </StrictMode>,
    document.getElementById('root')
  )
}

// stripped out by rollup in production
async function startMockAPI() {
  const { handlers } = await import('@oxide/api-mocks')
  const { setupWorker } = await import('msw')
  // mockServiceWorker.js needs to live at root, couldn't get app/ to work with
  // Vite. ugh don't ask
  const { default: workerUrl } = await import('../mockServiceWorker.js?url')
  // https://mswjs.io/docs/api/setup-worker/start#options
  await setupWorker(...handlers).start({
    quiet: true, // don't log successfully handled requests
    serviceWorker: { url: workerUrl },
    // custom handler only to make logging less noisy. unhandled requests still
    // pass through to the server
    onUnhandledRequest(req) {
      const path = req.url.pathname
      const ignore = [
        path.includes('libs/ui/assets'), // assets obviously loaded from file system
        path.startsWith('/forms/'), // lazy loaded forms
      ].some(Boolean)
      if (!ignore) {
        // message format copied from MSW source
        console.warn(`[MSW] Warning: captured an API request without a matching request handler:

  • ${req.method} ${req.url.pathname} 

If you want to intercept this unhandled request, create a request handler for it.`)
      }
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
