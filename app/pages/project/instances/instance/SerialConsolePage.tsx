/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '@oxide/api'
import { PrevArrow12Icon } from '@oxide/ui'

import { Badge, type BadgeColor } from '~/ui/lib/Badge'
import { Spinner } from '~/ui/lib/Spinner'
import EquivalentCliCommand from 'app/components/EquivalentCliCommand'
import { useInstanceSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const Terminal = lazy(() => import('app/components/Terminal'))

type WsState = 'connecting' | 'open' | 'closed' | 'error'

const statusColor: Record<WsState, BadgeColor> = {
  connecting: 'notice',
  open: 'default',
  closed: 'notice',
  error: 'destructive',
}

const statusMessage: Record<WsState, string> = {
  connecting: 'connecting',
  open: 'connected',
  closed: 'disconnected',
  error: 'error',
}

export function SerialConsolePage() {
  const instanceSelector = useInstanceSelector()
  const { project, instance } = instanceSelector

  const ws = useRef<WebSocket | null>(null)

  const [connectionStatus, setConnectionStatus] = useState<WsState>('connecting')

  // In dev, React 18 strict mode fires all effects twice for lulz, even ones
  // with no dependencies. In order to prevent the websocket from being killed
  // before it's even connected, in the cleanup callback we check not only that
  // it is non-null, but also that it is OPEN before trying to kill it. This
  // allows the effect to run twice with no ill effect.
  //
  // 1.  effect runs, WS connection initialized and starts connecting
  // 1a. cleanup runs, nothing happens because socket was not open yet
  // 2.  effect runs, but `ws.current` is truthy, so nothing happens
  useEffect(() => {
    // TODO: error handling if this connection fails
    if (!ws.current) {
      const { project, instance } = instanceSelector
      ws.current = api.ws.instanceSerialConsoleStream({
        secure: window.location.protocol === 'https:',
        host: window.location.host,
        path: { instance },
        query: { project, mostRecent: 262144 },
      })
      ws.current.binaryType = 'arraybuffer' // important!
    }
    return () => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close()
      }
    }
  }, [instanceSelector])

  // Because this one does not look at ready state, just whether the thing is
  // defined, it will remove the event listeners before the spurious second
  // render. But that's fine, we can add and remove listeners all day.
  //
  // 1.  effect runs, ws connection is there because the other effect has run,
  //     so listeners are attached
  // 1a. cleanup runs, event listeners removed
  // 2.  effect runs again, event listeners attached again
  useEffect(() => {
    const setOpen = () => setConnectionStatus('open')
    const setClosed = () => setConnectionStatus('closed')
    const setError = () => setConnectionStatus('error')

    ws.current?.addEventListener('open', setOpen)
    ws.current?.addEventListener('closed', setClosed)
    ws.current?.addEventListener('error', setError)

    return () => {
      ws.current?.removeEventListener('open', setOpen)
      ws.current?.removeEventListener('closed', setClosed)
      ws.current?.removeEventListener('error', setError)
    }
  }, [])

  const command = `oxide instance serial console
  --project ${project}
  --instance ${instance}`

  return (
    <div className="!mx-0 flex h-full max-h-[calc(100vh-60px)] !w-full flex-col">
      <Link
        to={pb.instance(instanceSelector)}
        className="mx-3 mb-6 mt-3 flex h-10 flex-shrink-0 items-center rounded px-3 bg-accent-secondary"
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

          <Badge color={statusColor[connectionStatus]}>
            {statusMessage[connectionStatus]}
          </Badge>
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
      <div className="absolute left-1/2 top-1/2 flex w-96 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center space-y-4 rounded-lg border p-12 !bg-raise border-secondary elevation-3">
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
