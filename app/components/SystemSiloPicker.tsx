/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'

import {
  Organization16Icon,
  SelectArrows6Icon,
  Servers16Icon,
  Success12Icon,
} from '@oxide/design-system/icons/react'

import { useCurrentUser } from '~/layouts/AuthenticatedLayout'
import * as DropdownMenu from '~/ui/lib/DropdownMenu'
import { pb } from '~/util/path-builder'

/**
 * Choose between System and Silo-scoped route trees, or if the user doesn't
 * have access to system routes (i.e., if systemPolicyView 403s) show the
 * current silo.
 */
export function SiloSystemPicker({ level }: { level: 'silo' | 'system' }) {
  const { isFleetViewer } = useCurrentUser()

  // if the user can't see the picker, show a placeholder control with their
  // silo name that links to root/home
  if (!isFleetViewer) {
    // TODO: is this supposed to be a link button? feels weird if not
    return (
      <div className="flex items-center rounded border p-1.5 text-quaternary border-secondary">
        <Organization16Icon />
      </div>
    )
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="flex items-center rounded border px-2 py-1.5 text-sans-md text-secondary border-secondary hover:bg-hover"
        aria-label="Switch between system and silo"
      >
        <div className="flex items-center text-quaternary">
          {level === 'system' ? <Servers16Icon /> : <Organization16Icon />}
        </div>
        <div className="ml-1.5 mr-3">{level === 'system' ? 'System' : 'Silo'}</div>
        {/* aria-hidden is a tip from the Reach docs */}
        <SelectArrows6Icon className="text-quinary" aria-hidden />
      </DropdownMenu.Trigger>
      {/* TODO: popover position should be further right */}
      <DropdownMenu.Content
        className="mt-2 max-h-80 min-w-[12.8125rem] overflow-y-auto"
        anchor="bottom start"
      >
        <Item to={pb.silos()} label="System" isSelected={level === 'system'} />
        <Item to={pb.projects()} label="Silo" isSelected={level === 'silo'} />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

function Item(props: { label: string; to: string; isSelected: boolean }) {
  return (
    <DropdownMenu.LinkItem
      to={props.to}
      className={cn({ 'is-selected': props.isSelected })}
    >
      <div className="flex w-full items-center gap-2">
        <div className="flex-grow">{props.label}</div>
        {props.isSelected && <Success12Icon className="-mr-3 block" />}
      </div>
    </DropdownMenu.LinkItem>
  )
}
