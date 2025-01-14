/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { CloseButton, Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import cn from 'classnames'
import { formatDistanceToNow } from 'date-fns'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'

import {
  AutoRestart12Icon,
  NextArrow12Icon,
  OpenLink12Icon,
} from '@oxide/design-system/icons/react'

import type { InstanceAutoRestartPolicy } from '~/api'
import { HL } from '~/components/HL'
import { useInstanceSelector } from '~/hooks/use-params'
import { Badge } from '~/ui/lib/Badge'
import { Spinner } from '~/ui/lib/Spinner'
import { useInterval } from '~/ui/lib/use-interval'
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

  useInterval({ fn: () => setNow(new Date()), delay: 1000 })

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
        <AutoRestart12Icon
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
          <PopoverRow label="Cooldown">
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

const PopoverRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex h-10 items-center border-b border-b-secondary">
    <div className="w-32 pl-3 pr-2 text-mono-sm text-tertiary">{label}</div>
    <div className="flex h-10 flex-grow items-center gap-1.5 pr-2 text-sans-md">
      {children}
    </div>
  </div>
)
