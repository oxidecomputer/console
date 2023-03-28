import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '@oxide/api'
import { PrevArrow12Icon, Spinner } from '@oxide/ui'

import EquivalentCliCommand from 'app/components/EquivalentCliCommand'
import { SerialConsoleStatusBadge } from 'app/components/StatusBadge'
import { useInstanceSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const Terminal = lazy(() => import('app/components/Terminal'))

// need prefix so Vite dev server can handle it specially
const pathPrefix = process.env.NODE_ENV === 'development' ? '/ws-serial-console' : ''

type WsState = 'connecting' | 'open' | 'closed' | 'error'

export function SerialConsolePage() {
  const instanceSelector = useInstanceSelector()
  const { project, instance } = instanceSelector

  const ws = useRef<WebSocket | null>(null)

  const [connectionStatus, setConnectionStatus] = useState<WsState>('connecting')

  const setOpen = useCallback(() => setConnectionStatus('open'), [])
  const setClosed = useCallback(() => setConnectionStatus('closed'), [])
  const setError = useCallback(() => setConnectionStatus('error'), [])

  useEffect(() => {
    // TODO: error handling if this connection fails
    if (!ws.current) {
      const { project, instance } = instanceSelector
      ws.current = api.ws.instanceSerialConsoleStream(window.location.host + pathPrefix, {
        path: { instance },
        query: { project, fromStart: 0 },
      })
      ws.current.binaryType = 'arraybuffer'

      ws.current.addEventListener('open', setOpen)
      ws.current.addEventListener('closed', setClosed)
      ws.current.addEventListener('error', setError)
      // this is pretty important :|
    }
    // In dev, React 18 strict mode fires all effects twice for lulz, even ones
    // with no dependencies. In order to prevent the websocket from being killed
    // before it's even connected, we check not only that it is non-null, but
    // also that it is OPEN before trying to kill it. This allows the effect to
    // run twice with no ill effect.
    //
    // 1.  effect runs, WS connection initialized and starts connecting
    // 1a. cleanup runs, but nothing happens because socket was not open yet
    // 2.  effect runs, but `ws.current` is truthy, so nothing happens
    return () => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close()
        ws.current.removeEventListener('open', setOpen)
        ws.current.removeEventListener('closed', setClosed)
        ws.current.removeEventListener('error', setError)
        ws.current = null
      }
    }
  }, [instanceSelector, setOpen, setClosed, setError])

  const command = `oxide instance serial
  --project ${project}
  ${instance}
  --continuous`

  return (
    <div className="!mx-0 flex h-full max-h-[calc(100vh-60px)] !w-full flex-col">
      <Link
        to={pb.instance(instanceSelector)}
        className="mx-3 mt-3 mb-6 flex h-10 flex-shrink-0 items-center rounded px-3 bg-accent-secondary"
      >
        <PrevArrow12Icon className="text-accent-tertiary" />
        <div className="ml-2 text-mono-sm text-accent">
          <span className="text-accent-tertiary">Back to</span> instance
        </div>
      </Link>

      <div className="gutter relative w-full flex-shrink flex-grow overflow-hidden">
        {connectionStatus !== 'open' && <SerialSkeleton />}
        <Suspense fallback={null}>{ws.current && <Terminal ws={ws.current} />}</Suspense>
      </div>
      <div className="flex-shrink-0 justify-between overflow-hidden border-t bg-default border-secondary empty:border-t-0">
        <div className="gutter flex h-20 items-center justify-between">
          <div>
            <EquivalentCliCommand command={command} />
          </div>

          <SerialConsoleStatusBadge
            status={connectionStatus === 'open' ? 'connected' : 'connecting'}
          />
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
