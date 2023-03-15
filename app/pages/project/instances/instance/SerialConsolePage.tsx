import { Suspense, lazy, useState } from 'react'
import { Link } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { Button } from '@oxide/ui'
import { DirectionLeftIcon, Modal, Spinner, Success12Icon, useTimeout } from '@oxide/ui'
import { MiB } from '@oxide/util'

import { SerialConsoleStatusBadge } from 'app/components/StatusBadge'
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
        <Suspense fallback={null}>
          <Terminal data={data?.data} />
        </Suspense>
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

            <EquivalentCliCommand />
          </div>

          <SerialConsoleStatusBadge status={data ? 'connected' : 'connecting'} />
        </div>
      </div>
    </div>
  )
}

function EquivalentCliCommand() {
  const [isOpen, setIsOpen] = useState(false)
  const { organization, project, instance } = useInstanceSelector()
  const [hasCopied, setHasCopied] = useState(false)

  const code = `oxide instance serial
  -p ${project}
  -o ${organization}
  ${instance}
  --continuous`

  function handleDismiss() {
    setIsOpen(false)
  }

  useTimeout(() => setHasCopied(false), hasCopied ? 2000 : null)

  const handleCopy = () => {
    window.navigator.clipboard.writeText(code).then(() => {
      setHasCopied(true)
    })
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="ml-2" onClick={() => setIsOpen(true)}>
        Equivalent CLI Command
      </Button>
      <Modal isOpen={isOpen} onDismiss={handleDismiss}>
        <Modal.Title>CLI Command</Modal.Title>

        <Modal.Section>
          {/* todo: fix the token to disable contextual alternates in the mono font */}
          <pre className="flex w-full rounded border px-4 py-3 !normal-case !tracking-normal text-mono-md bg-default border-secondary [font-feature-settings:_'calt'_off]">
            <div className="mr-2 select-none text-quaternary">$</div>
            {code}
          </pre>
        </Modal.Section>
        <Modal.Footer
          onDismiss={handleDismiss}
          onAction={handleCopy}
          actionText={
            <>
              <span className={hasCopied ? 'invisible' : ''}>Copy command</span>
              <span
                className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center ${
                  hasCopied ? '' : 'invisible'
                }`}
              >
                <Success12Icon className="mr-2 text-accent" />
                Copied
              </span>
            </>
          }
        />
      </Modal>
    </>
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
