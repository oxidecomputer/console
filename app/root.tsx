import { QueryClientProvider } from '@tanstack/react-query'
import { LazyMotion, MotionConfig } from 'motion/react'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Outlet, Scripts } from 'react-router'

import { queryClient } from '@oxide/api'

import { SkipLink } from '~/ui/lib/SkipLink'

import { ConfirmActionModal } from './components/ConfirmActionModal'
import { ErrorBoundary } from './components/ErrorBoundary'
// this is the only allowed css import
// eslint-disable-next-line no-restricted-imports
import '~/ui/styles/index.css'

const loadFeatures = () => import('./util/motion-features').then((res) => res.domAnimation)

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Oxide Console</title>

        <meta name="viewport" content="width=1050" />

        <link rel="icon" type="image/svg+xml" href="./app/assets/favicon.svg" />
        <link rel="icon" type="image/png" href="./app/assets/favicon.png" />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

export default function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <LazyMotion strict features={loadFeatures}>
        <MotionConfig reducedMotion="user">
          <ErrorBoundary>
            <ConfirmActionModal />
            <SkipLink id="skip-nav" />
            <Outlet />
          </ErrorBoundary>
        </MotionConfig>
      </LazyMotion>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  )
}
