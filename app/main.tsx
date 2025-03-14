/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { QueryClientProvider } from '@tanstack/react-query'
import { LazyMotion, MotionConfig } from 'motion/react'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import { queryClient } from '@oxide/api'

import { ConfirmActionModal } from './components/ConfirmActionModal'
import { ErrorBoundary } from './components/ErrorBoundary'
// stripped out by rollup in production
import { startMockAPI } from './msw-mock-api'
import { routes } from './routes'
// this is the only allowed css import
// eslint-disable-next-line no-restricted-imports
import '~/ui/styles/index.css'

import { SkipLink } from '~/ui/lib/SkipLink'

if (process.env.SHA) {
  console.info(
    'Oxide Web Console version',
    `https://github.com/oxidecomputer/console/commits/${process.env.SHA}`
  )
}

const loadFeatures = () => import('./util/motion-features').then((res) => res.domAnimation)

const root = createRoot(document.getElementById('root')!)

function render() {
  // createBrowserRouter kicks off the loaders, which is weird because you'd
  // think route matching hasn't happened yet, but apparently it does its own
  // matching. I asked about this on Discord and they said it's intentional.
  // This means RR is best thought of as an external store that runs
  // independently of the React render lifecycle.
  const router = createBrowserRouter(routes)

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <LazyMotion strict features={loadFeatures}>
          <MotionConfig reducedMotion="user">
            <ErrorBoundary>
              <ConfirmActionModal />
              <SkipLink id="skip-nav" />
              <RouterProvider router={router} />
            </ErrorBoundary>
          </MotionConfig>
        </LazyMotion>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </StrictMode>
  )
}

if (process.env.MSW) {
  // MSW has NODE_ENV !== prod built into it, but let's be extra safe
  // need to defer requests until after the mock server starts up
  startMockAPI().then(render)
} else {
  render()
}
