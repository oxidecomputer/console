import { Suspense, lazy, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@oxide/ui'
import { DirectionLeftIcon, Spinner } from '@oxide/ui'

import { SerialConsoleStatusBadge } from 'app/components/StatusBadge'
import { useInstanceSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const Terminal = lazy(() => import('app/components/Terminal'))

export function SerialConsolePage() {
  const { organization, project, instance } = useInstanceSelector()

  // unclear if this should be a ref, it could be normal state or even a useMemo
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // TODO: janky to do this url construction here. maybe we can have oxide.ts
    // detect websocket endpoints and give us a helper that constructs a WebSocket
    // instead of calling fetch
    // TODO: error handling if this connection fails
    const wsUrl = `ws://${window.location.host}/v1/instances/${instance}/serial-console/stream?organization=${organization}&project=${project}`
    wsRef.current = new WebSocket(wsUrl)
    return () => wsRef.current?.close()
  }, [organization, project, instance])

  const connected = wsRef.current?.readyState === WebSocket.OPEN

  return (
    <div className="!mx-0 flex h-full max-h-[calc(100vh-60px)] !w-full flex-col">
      <Link
        to={pb.instance({ organization, project, instance })}
        className="mx-3 mt-3 mb-6 flex h-10 flex-shrink-0 items-center rounded px-3 bg-accent-secondary"
      >
        <DirectionLeftIcon className="text-accent-tertiary" />
        <div className="ml-2 text-mono-sm text-accent">
          <span className="text-accent-tertiary">Back to</span> instance
        </div>
      </Link>

      <div className="gutter relative w-full flex-shrink flex-grow overflow-hidden">
        {!connected && <SerialSkeleton />}
        <Suspense fallback={null}>
          {wsRef.current && <Terminal ws={wsRef.current} />}
        </Suspense>
      </div>
      <div className="flex-shrink-0 justify-between overflow-hidden border-t bg-default border-secondary empty:border-t-0">
        <div className="gutter flex h-20 items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" className="ml-2">
              Equivalent CLI Command
            </Button>
          </div>

          <SerialConsoleStatusBadge status={connected ? 'connected' : 'connecting'} />
        </div>
      </div>
    </div>
  )
}

function SerialSkeleton() {
  const instanceSelector = useInstanceSelector()

  return (
    <div className="relative h-full flex-shrink flex-grow overflow-hidden">
      <div className="h-full space-y-2 overflow-hidden">
        {[...Array(200)].map((_e, i) => (
          <div
            key={i}
            className="h-4 rounded bg-tertiary motion-safe:animate-pulse"
            style={{
              width: `${Math.sin(Math.sin(i)) * 20 + 40}%`,
            }} /* this is silly deterministic way to get random looking lengths */
          />
        ))}
      </div>

      <div
        className="absolute bottom-0 h-full w-full"
        style={{
          background: 'linear-gradient(180deg, rgba(8, 15, 17, 0) 0%, #080F11 100%)',
        }}
      />
      <div className="absolute top-1/2 left-1/2 flex w-96 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center space-y-4 rounded-lg border p-12 !bg-raise border-secondary elevation-3">
        <Spinner size="lg" />

        <div className="space-y-2">
          <p className="text-center text-sans-xl text-default">
            Connecting to{' '}
            <Link to={pb.instance(instanceSelector)} className="text-accent-secondary">
              {instanceSelector.instance}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
