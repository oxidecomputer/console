/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { useEffect, useRef, useState } from 'react'
import { Link, type LoaderFunctionArgs } from 'react-router'

import {
  api,
  instanceCan,
  instanceSerialConsoleStream,
  q,
  queryClient,
  usePrefetchedQuery,
  type Instance,
} from '@oxide/api'
import { PrevArrow12Icon } from '@oxide/design-system/icons/react'
import { Badge, type BadgeColor } from '@oxide/design-system/ui'

import { EquivalentCliCommand } from '~/components/CopyCode'
import { InstanceStateBadge } from '~/components/StateBadge'
import { Terminal } from '~/components/Terminal'
import { getInstanceSelector, useInstanceSelector } from '~/hooks/use-params'
import { Spinner } from '~/ui/lib/Spinner'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

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

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project, instance } = getInstanceSelector(params)
  await queryClient.prefetchQuery(
    q(api.instanceView, { path: { instance }, query: { project } })
  )
  return null
}

function isStarting(i: Instance | undefined) {
  return i?.runState === 'creating' || i?.runState === 'starting'
}

const instanceView = ({ project, instance }: PP.Instance) =>
  q(api.instanceView, { path: { instance }, query: { project } })

export const handle = { crumb: 'Serial Console' }

export default function SerialConsolePage() {
  const instanceSelector = useInstanceSelector()
  const { project, instance } = instanceSelector

  const { data: instanceData } = usePrefetchedQuery({
    ...instanceView({ project, instance }),
    // if we land here and the instance is starting, we will not be able to
    // connect, so we poll and connect as soon as it's running.
    refetchInterval: (q) => (isStarting(q.state.data) ? 1000 : false),
  })

  const ws = useRef<WebSocket | null>(null)

  const canConnect = instanceCan.serialConsole(instanceData)
  const initialState = canConnect ? 'connecting' : 'closed'
  const [connectionStatus, setConnectionStatus] = useState<WsState>(initialState)

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
    if (!canConnect) return

    // TODO: error handling if this connection fails
    if (!ws.current) {
      const { project, instance } = instanceSelector
      ws.current = instanceSerialConsoleStream({
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
  }, [instanceSelector, canConnect])

  // Because this one does not look at ready state, just whether the thing is
  // defined, it will remove the event listeners before the spurious second
  // render. But that's fine, we can add and remove listeners all day.
  //
  // 1.  effect runs, ws connection is there because the other effect has run,
  //     so listeners are attached
  // 1a. cleanup runs, event listeners removed
  // 2.  effect runs again, event listeners attached again
  useEffect(() => {
    if (!canConnect) return // don't bother if instance is not running

    const setOpen = () => setConnectionStatus('open')
    const setClosed = () => setConnectionStatus('closed')
    const setError = () => setConnectionStatus('error')

    ws.current?.addEventListener('open', setOpen)
    ws.current?.addEventListener('close', setClosed)
    ws.current?.addEventListener('error', setError)

    return () => {
      ws.current?.removeEventListener('open', setOpen)
      ws.current?.removeEventListener('close', setClosed)
      ws.current?.removeEventListener('error', setError)
    }
  }, [canConnect])

  return (
    <div className="mx-0! flex h-full max-h-[calc(100vh-var(--top-bar-height))] w-full! flex-col">
      <Link
        to={pb.instance(instanceSelector)}
        className="bg-accent mx-3 mt-3 mb-6 flex h-10 shrink-0 items-center rounded-md px-3"
      >
        <PrevArrow12Icon className="text-accent-tertiary" />
        <div className="text-mono-sm text-accent ml-2">
          <span className="text-accent-tertiary">Back to</span> instance
        </div>
      </Link>
      <div className="gutter relative shrink grow overflow-hidden">
        {connectionStatus === 'connecting' && <ConnectingSkeleton />}
        {connectionStatus === 'error' && <ErrorSkeleton />}
        {connectionStatus === 'closed' && !canConnect && (
          <CannotConnect instance={instanceData} />
        )}
        {/* closed && canConnect shouldn't be possible because there's no way to
         * close an open connection other than leaving the page */}
        {ws.current && <Terminal ws={ws.current} />}
      </div>
      <div className="bg-default border-secondary shrink-0 justify-between overflow-hidden border-t empty:border-t-0">
        <div className="gutter flex h-20 items-center justify-between">
          <div>
            <EquivalentCliCommand project={project} instance={instance} />
          </div>

          <Badge color={statusColor[connectionStatus]}>
            {statusMessage[connectionStatus]}
          </Badge>
        </div>
      </div>
    </div>
  )
}

type SkeletonProps = {
  children: React.ReactNode
  animate?: boolean
}

function SerialSkeleton({ children, animate }: SkeletonProps) {
  return (
    <div className="relative h-full shrink grow overflow-hidden">
      <div className="h-full space-y-2 overflow-hidden">
        {[...Array(200)].map((_e, i) => (
          <div
            key={i}
            className={cn('bg-tertiary h-4 rounded-md', {
              'motion-safe:animate-pulse': animate,
            })}
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
      <div className="bg-raise! shadow-modal absolute top-1/2 left-1/2 flex w-96 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-lg p-12">
        {children}
      </div>
    </div>
  )
}

const ConnectingSkeleton = () => (
  <SerialSkeleton animate>
    <Spinner size="lg" />
    <div className="mt-4 text-center">
      <p className="text-sans-xl">Connecting to serial console</p>
    </div>
  </SerialSkeleton>
)

const CannotConnect = ({ instance }: { instance: Instance }) => (
  <SerialSkeleton animate={isStarting(instance)}>
    <p className="text-sans-xl flex items-center justify-center">
      <span>The instance is </span>
      <InstanceStateBadge className="ml-1.5" state={instance.runState} />
    </p>
    <p className="text-default mt-2 text-center text-balance">
      {isStarting(instance)
        ? 'Waiting for the instance to start before connecting.'
        : 'You can only connect to the serial console on a running instance.'}
    </p>
  </SerialSkeleton>
)

// TODO: sure would be nice to say something useful about the error, but
// we don't know what kind of thing we might pull off the error event
const ErrorSkeleton = () => (
  <SerialSkeleton>
    <p className="text-sans-xl flex items-center justify-center text-center">
      Serial console connection failed
    </p>
    <p className="text-default mt-2 text-center">Please try again.</p>
  </SerialSkeleton>
)
