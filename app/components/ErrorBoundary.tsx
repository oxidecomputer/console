import NotFound from 'app/pages/NotFound'

import { ErrorBoundary as BaseErrorBoundary } from 'react-error-boundary'
import { useRouteError } from 'react-router-dom'

type Props = { error: Error | Response }

function ErrorFallback({ error }: Props) {
  if (error instanceof Response && error.status === 404) {
    return <NotFound />
  }

  // since 404s are the only response error that propagates up here, we should
  // be a normal Error at this point but there's no way to guarantee that
  const message = 'message' in error ? error.message : ''
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
  const error = useRouteError()
  return <ErrorFallback error={error} />
}
