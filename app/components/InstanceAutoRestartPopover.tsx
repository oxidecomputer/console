/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { CloseButton, Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { formatDistanceToNow } from 'date-fns'
import { type ReactNode } from 'react'
import { Link } from 'react-router'
import { match, P } from 'ts-pattern'

import { Badge } from '@oxide/design-system/components'
import {
  AutoRestart12Icon,
  NextArrow12Icon,
  OpenLink12Icon,
} from '@oxide/design-system/icons/react'

import type { Instance } from '~/api'
import { instanceAutoRestartingSoon } from '~/api/util'
import { useInstanceSelector } from '~/hooks/use-params'
import { Spinner } from '~/ui/lib/Spinner'
import { links } from '~/util/links'
import { pb } from '~/util/path-builder'

/**
 * Appears if and only if the instance is failed.
 */
export const InstanceAutoRestartPopover = ({ instance }: { instance: Instance }) => {
  const instanceSelector = useInstanceSelector()
  if (instance.runState !== 'failed') return null // important!

  const {
    autoRestartCooldownExpiration: cooldownExpiration,
    autoRestartPolicy: policy,
    autoRestartEnabled: enabled,
  } = instance

  const restartingSoon = instanceAutoRestartingSoon(instance)

  return (
    <Popover>
      <PopoverButton
        className="border-default hover:bg-hover group flex h-6 w-6 items-center justify-center rounded border"
        aria-label="Auto-restart status"
      >
        <AutoRestart12Icon className="shrink-0" aria-hidden />
      </PopoverButton>
      <PopoverPanel
        // popover-panel needed for enter animation
        className="popover-panel bg-raise border-secondary elevation-2 z-10 w-96 rounded-lg border"
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
            {match(policy)
              .with('never', () => (
                <Badge color="neutral" variant="solid">
                  never
                </Badge>
              ))
              .with('best_effort', () => <Badge>best effort</Badge>)
              .with(P.nullish, () => <Badge color="neutral">Default</Badge>)
              .exhaustive()}
            <div className="transition-transform group-hover:translate-x-1">
              <NextArrow12Icon />
            </div>
          </CloseButton>
        </PopoverRow>
        {enabled && cooldownExpiration && (
          <PopoverRow label="Cooldown">
            {restartingSoon ? (
              <>
                <Spinner className="mr-0.5" /> Restarting soon…
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
        <div className="text-sans-md text-default p-3">
          <p className="mb-2 pr-4">
            {enabled
              ? restartingSoon
                ? 'This instance will automatically restart soon.'
                : 'This instance will automatically restart after the cooldown period.'
              : 'This instance will not automatically restart.'}
          </p>
          <a
            href={links.instanceUpdateDocs}
            className="group"
            target="_blank"
            rel="noreferrer"
          >
            <span className="inline-block max-w-300 truncate align-middle">
              Learn about{' '}
              <span className="group-hover:link-with-underline text-raise">
                Instance Auto-Restart
              </span>
            </span>
            <OpenLink12Icon className="text-secondary ml-1 translate-y-px" />
          </a>
        </div>
      </PopoverPanel>
    </Popover>
  )
}

const PopoverRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="border-b-secondary flex h-10 items-center border-b">
    <div className="text-mono-sm text-tertiary w-32 pr-2 pl-3">{label}</div>
    <div className="text-sans-md flex h-10 grow items-center gap-1.5 pr-2">{children}</div>
  </div>
)
