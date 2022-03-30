import type { ErrorResponse } from '@oxide/api'
import NotFound from 'app/pages/NotFound'
import React from 'react'
import { ErrorBoundary as BaseErrorBoundary } from 'react-error-boundary'

const ErrorFallback = (props: { error: Error | ErrorResponse }) => {
  const error = (props.error as ErrorResponse).error ?? props.error
  if ((props.error as ErrorResponse).status === 404) {
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
  <BaseErrorBoundary FallbackComponent={ErrorFallback}>
    {props.children}
  </BaseErrorBoundary>
)
