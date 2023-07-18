/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { ErrorBoundary as BaseErrorBoundary } from 'react-error-boundary'
import { useRouteError } from 'react-router-dom'

import type { ApiError } from '@oxide/api'

import NotFound from 'app/pages/NotFound'

export const trigger404 = { type: 'error', statusCode: 404 }

type Props = { error: Error | ApiError }

function ErrorFallback({ error }: Props) {
  if ('statusCode' in error && error.statusCode === 404) {
    return <NotFound />
  }

  return (
    <div role="alert" className="m-48">
      <h1 className="text-2xl mb-6 text-sans-md">Error</h1>
      <pre className="whitespace-pre-wrap">{error.message}</pre>
    </div>
  )
}

export const ErrorBoundary = (props: { children: React.ReactNode }) => (
  <BaseErrorBoundary FallbackComponent={ErrorFallback}>{props.children}</BaseErrorBoundary>
)

export function RouterDataErrorBoundary() {
  // TODO: validate this unknown at runtime _before_ passing to ErrorFallback
  const error = useRouteError() as Props['error']
  return <ErrorFallback error={error} />
}
