import { CloseButton, Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import cn from 'classnames'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'

import { NextArrow12Icon, OpenLink12Icon } from '@oxide/design-system/icons/react'

import type { InstanceAutoRestartPolicy } from '~/api'
import { HL } from '~/components/HL'
import { useInstanceSelector } from '~/hooks/use-params'
import { Badge } from '~/ui/lib/Badge'
import { Spinner } from '~/ui/lib/Spinner'
import { pb } from '~/util/path-builder'

const helpText = {
  enabled: (
    <>The control plane will attempt to automatically restart instance this instance.</>
  ),
  disabled: (
    <>
      The control plane will not attempt to automatically restart it after entering the{' '}
      <HL>failed</HL> state.
    </>
  ),
  never: (
    <>
      Instance auto-restart policy is set to never. The control plane will not attempt to
      automatically restart it after entering the <HL>failed</HL> state.
    </>
  ),
  starting: (
    <>
      Instance auto-restart policy is queued to start. The control plane will begin the
      restart process shortly.
    </>
  ),
}

export const InstanceAutoRestartPopover = ({
  enabled,
  policy,
  cooldownExpiration,
}: {
  enabled: boolean
  policy: InstanceAutoRestartPolicy
  cooldownExpiration: Date | undefined
}) => {
  const instanceSelector = useInstanceSelector()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const isQueued = cooldownExpiration && new Date(cooldownExpiration) < now

  // todo: untangle this web
  const helpTextState = isQueued
    ? 'starting'
    : policy === 'never'
      ? 'never'
      : enabled
        ? 'enabled'
        : ('disabled' as const)

  return (
    <Popover>
      <PopoverButton className="group flex h-6 w-6 items-center justify-center rounded border border-default hover:bg-hover">
        <AutoRestartIcon12
          className={cn('shrink-0 transition-transform', enabled && 'animate-spin-slow')}
        />
      </PopoverButton>
      <PopoverPanel
        // popover-panel needed for enter animation
        className="popover-panel z-10 w-96 rounded-lg border bg-raise border-secondary elevation-2"
        anchor={{ to: 'bottom start', gap: 12 }}
      >
        <PopoverRow label="Auto Restart">
          {enabled ? <Badge>Enabled</Badge> : <Badge color="neutral">Disabled</Badge>}
        </PopoverRow>
        <PopoverRow label="Policy">
          <CloseButton
            as={Link}
            to={pb.instanceSettings(instanceSelector)}
            className="group -m-1 flex w-full items-center justify-between rounded px-1"
          >
            {policy ? (
              policy === 'never' ? (
                <Badge color="neutral" variant="solid">
                  never
                </Badge>
              ) : (
                <Badge>best effort</Badge>
              )
            ) : (
              <Badge color="neutral">Default</Badge>
            )}
            <div className="transition-transform group-hover:translate-x-1">
              <NextArrow12Icon />
            </div>
          </CloseButton>
        </PopoverRow>
        {cooldownExpiration && (
          <PopoverRow label="State">
            {isQueued ? (
              <>
                <Spinner /> Queued for restart…
              </>
            ) : (
              <div>
                Waiting{' '}
                <span className="text-tertiary">
                  ({formatDistanceToNow(cooldownExpiration)})
                </span>
              </div>
            )}
          </PopoverRow>
        )}
        <div className="p-3 text-sans-md text-default">
          <p className="mb-2 pr-4">{helpText[helpTextState]}</p>
          <a href="/">
            <span className="inline-block max-w-[300px] truncate align-middle">
              Learn about <span className="text-raise">Instance Auto-Restart</span>
            </span>
            <OpenLink12Icon className="ml-1 translate-y-[1px] text-secondary" />
          </a>
        </div>
      </PopoverPanel>
    </Popover>
  )
}

const AutoRestartIcon12 = ({ className }: { className?: string }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M6 10.5C6.44357 10.5 6.87214 10.4358 7.27695 10.3162C7.59688 10.2217 7.95371 10.3259 8.13052 10.6088L8.22881 10.7661C8.43972 11.1035 8.31208 11.5527 7.9354 11.681C7.32818 11.8878 6.67719 12 6 12C2.68629 12 0 9.31371 0 6C0 2.68629 2.68629 0 6 0C9.31371 0 12 2.68629 12 6C12 7.2371 11.6119 8.42336 10.9652 9.39169C10.74 9.72899 10.2624 9.72849 9.99535 9.42325L7.9723 7.1112C7.59324 6.67799 7.90089 6 8.47652 6H10.5C10.5 3.51472 8.48528 1.5 6 1.5C3.51472 1.5 1.5 3.51472 1.5 6C1.5 8.48528 3.51472 10.5 6 10.5Z"
      fill="currentColor"
    />
  </svg>
)

const PopoverRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex h-10 items-center border-b border-b-secondary">
    <div className="w-32 pl-3 pr-2 text-mono-sm text-tertiary">{label}</div>
    <div className="flex h-10 flex-grow items-center gap-2 pr-2 text-sans-md">
      {children}
    </div>
  </div>
)
