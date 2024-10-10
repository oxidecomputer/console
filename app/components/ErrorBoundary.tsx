/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { ErrorBoundary as BaseErrorBoundary } from 'react-error-boundary'
import { useRouteError } from 'react-router-dom'

import { type ApiError } from '~/api/errors'

import { ErrorPage, NotFound } from './ErrorPage'

export const trigger404 = { type: 'error', statusCode: 404 }

type Props = { error: Error | ApiError }

function ErrorFallback({ error }: Props) {
  if ('statusCode' in error && error.statusCode === 404) {
    return <NotFound />
  }

  return (
    <ErrorPage>
      <h1 className="text-sans-2xl">Something went wrong</h1>
      <p className="text-tertiary">
        Please try again. If the problem persists, contact your administrator.
      </p>
    </ErrorPage>
  )
}

export const ErrorBoundary = (props: { children: React.ReactNode }) => (
  <BaseErrorBoundary FallbackComponent={ErrorFallback}>{props.children}</BaseErrorBoundary>
)

export function RouterDataErrorBoundary() {
  // TODO: validate this unknown at runtime _before_ passing to ErrorFallback
  const error = useRouteError() as Props['error']
  console.error(error)
  return <ErrorFallback error={error} />
}
