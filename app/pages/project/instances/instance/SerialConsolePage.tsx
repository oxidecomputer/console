import throttle from 'lodash.throttle'
import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { Button } from '@oxide/ui'
import { DirectionLeftIcon, Spinner } from '@oxide/ui'
import { MiB } from '@oxide/util'

import { SerialConsoleStatusBadge } from 'app/components/StatusBadge'
import 'app/components/serial-console.css'
import { useInstanceSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const Terminal = lazy(() => import('app/components/Terminal'))

export function SerialConsolePage() {
  const { organization, project, instance } = useInstanceSelector()

  const { isRefetching, data, refetch } = useApiQuery(
    'instanceSerialConsoleV1',
    {
      path: { instance },
      // holding off on using toPathQuery for now because it doesn't like numbers
      query: { organization, project, maxBytes: 10 * MiB, fromStart: 0 },
    },
    { refetchOnWindowFocus: false }
  )

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
        {!data && <SerialSkeleton />}
        {/* This is a bit silly but we want to get this going as early as possible
            because it's downloading the Terminal component. We can probably expect
            it to be done before the API call, so we'll never see the fallback. */}
        <div className={data ? '' : 'hidden'}>
          <Suspense fallback={null}>
            <Terminal className="h-full w-full" data={data?.data} />
          </Suspense>
        </div>
      </div>
      <div className="flex-shrink-0 justify-between overflow-hidden border-t bg-default border-secondary empty:border-t-0">
        <div className="gutter flex h-20 items-center justify-between">
          <div>
            <Button
              loading={isRefetching}
              size="sm"
              onClick={() => refetch()}
              disabled={!data}
            >
              Refresh
            </Button>

            <Button variant="ghost" size="sm" disabled={!data} className="ml-2">
              Equivalent CLI Command
            </Button>
          </div>

          <SerialConsoleStatusBadge status={data ? 'connected' : 'connecting'} />
        </div>
      </div>
    </div>
  )
}

function SerialSkeleton() {
  const { organization, project, instance } = useInstanceSelector()

  const skeletonEl = useRef<HTMLDivElement>(null)
  const [skeletonCount, setSkeletonCount] = useState(80)

  const addBlocks = throttle(
    () => {
      if (!skeletonEl || !skeletonEl.current) {
        return
      }

      setSkeletonCount(Math.floor(skeletonEl.current.offsetHeight / 24) + 1)
    },
    125,
    { leading: true, trailing: true }
  )

  useEffect(() => {
    window.addEventListener('resize', addBlocks)
    return () => {
      window.removeEventListener('resize', addBlocks)
    }
  }, [skeletonEl, addBlocks])

  return (
    <div className="relative h-full flex-shrink flex-grow overflow-hidden">
      <div ref={skeletonEl} className="h-full space-y-2 overflow-hidden">
        {[...Array(skeletonCount)].map((_e, i) => (
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
            <Link
              to={pb.instance({ organization, project, instance })}
              className="text-accent-secondary"
            >
              {instance}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
