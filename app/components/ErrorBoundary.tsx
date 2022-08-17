import { ErrorBoundary as BaseErrorBoundary } from 'react-error-boundary'
import { useRouteError } from 'react-router-dom'

import type { ErrorResult } from '@oxide/api'

import NotFound from 'app/pages/NotFound'

type Props = { error: Error | ErrorResult }

function ErrorFallback({ error }: Props) {
  if ('type' in error && error.type === 'error' && error.statusCode === 404) {
    return <NotFound />
  }

  const message = 'message' in error ? error.message : error.error.message
  return (
    <div role="alert" className="m-48">
      <h1 className="text-2xl mb-6 text-sans-md">Error</h1>
      <pre className="whitespace-pre-wrap">{message}</pre>
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
