/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { CSPProvider } from '@base-ui/react/csp-provider'
import { QueryClientProvider } from '@tanstack/react-query'
import { LazyMotion, MotionConfig } from 'motion/react'
import { useSyncExternalStore, type ReactNode } from 'react'
import { Links, Meta, Outlet, Scripts } from 'react-router'

import { queryClient } from '@oxide/api'

import faviconPng from './assets/favicon.png'
import faviconSvg from './assets/favicon.svg'
import { ConfirmActionModal } from './components/ConfirmActionModal'
import {
  ErrorBoundary as AppErrorBoundary,
  RouterDataErrorBoundary,
} from './components/ErrorBoundary'
import { PreviewBannerLayout } from './components/MswBanner'
import { PageSkeleton } from './components/PageSkeleton'
import { SkipLink } from './ui/lib/SkipLink'
// Keep the global stylesheet ordering in one place.
// eslint-disable-next-line no-restricted-imports
import './ui/styles/index.css'

const loadFeatures = () => import('./util/motion-features').then((res) => res.domAnimation)

export function Layout({ children }: { children: ReactNode }) {
  const nonce = import.meta.env.SSR
    ? process.env.CSP_NONCE
    : document.querySelector<HTMLScriptElement>('script[nonce]')?.nonce
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />

        <title>Oxide Console</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="dark light" />
        <link rel="icon" type="image/svg+xml" href={faviconSvg} />
        <link rel="icon" type="image/png" href={faviconPng} />
        <script src={`/assets/theme-init.js?v=${process.env.THEME_INIT_HASH}`} />
        {process.env.VERCEL && (
          <>
            <script
              defer
              src="/viewscript.js"
              data-domain={
                process.env.VERCEL_ENV === 'production'
                  ? 'oxide-console-preview.vercel.app'
                  : 'console-pr-preview.vercel.app'
              }
            />
            <meta property="og:image" content="/assets/og-preview-image.webp" />
            <meta
              property="og:description"
              content="Preview of the Oxide web console with in-browser mock API"
            />
          </>
        )}
        <Meta />
        {/* Avoid inheriting the dev script nonce: browsers hide nonce attributes,
            which would make the critical CSS link disagree during hydration. */}
        <Links nonce={import.meta.env.DEV ? '' : undefined} />
      </head>
      <body>
        <CSPProvider disableStyleElements>
          <QueryClientProvider client={queryClient}>
            <LazyMotion strict features={loadFeatures}>
              <MotionConfig reducedMotion="user">
                <PreviewBannerLayout>
                  <AppErrorBoundary>{children}</AppErrorBoundary>
                </PreviewBannerLayout>
              </MotionConfig>
            </LazyMotion>
          </QueryClientProvider>
        </CSPProvider>
        <noscript>
          <div className="grid min-h-screen place-content-center">
            <p className="max-w-lg p-8 text-center text-balance">
              This site requires JavaScript. If you don't want to enable JavaScript, see the{' '}
              <a
                href="https://docs.oxide.computer/"
                className="external-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Oxide docs
              </a>{' '}
              to learn about accessing the API through the CLI or SDKs.
            </p>
          </div>
        </noscript>
        <Scripts nonce={nonce} />
      </body>
    </html>
  )
}

const subscribe = () => () => {}

export function HydrateFallback() {
  // The build renders one shell for every URL. Choose the path-specific loading
  // UI after hydration so login/device routes don't get the console skeleton.
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
  return hydrated ? <PageSkeleton skipPaths={[/^\/login\//, /^\/device\//]} /> : null
}

export default function App() {
  return (
    <>
      <ConfirmActionModal />
      <SkipLink id="skip-nav" />
      <Outlet />
    </>
  )
}

export function ErrorBoundary() {
  return <RouterDataErrorBoundary />
}
