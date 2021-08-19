import React from 'react'
import { ErrorBoundary as BaseErrorBoundary } from 'react-error-boundary'

const ErrorFallback = (props: { error: Error }) => (
  <div role="alert" className="m-48">
    <h1 className="text-2xl font-medium mb-6">Error</h1>
    <pre className="whitespace-pre-wrap">{props.error.message}</pre>
  </div>
)

export const ErrorBoundary = (props: { children: React.ReactNode }) => (
  <BaseErrorBoundary FallbackComponent={ErrorFallback}>
    {props.children}
  </BaseErrorBoundary>
)
