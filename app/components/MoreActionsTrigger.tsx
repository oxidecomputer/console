/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { More12Icon } from '@oxide/design-system/icons/react'

import { DropdownMenu } from '~/ui/lib/DropdownMenu'

type MoreActionsTriggerProps = {
  inTable: boolean
  label: string
  onClick?: (e: MouseEvent) => void
}
export const MoreActionsTrigger = ({ inTable, label }: MoreActionsTriggerProps) => {
  const className = inTable
    ? 'h-full w-10'
    : 'h-8 w-8 rounded border border-default hover:bg-tertiary'
  return (
    <DropdownMenu.Trigger
      aria-label={label}
      className={`flex items-center justify-center ${className}`}
    >
      <More12Icon className="text-tertiary" />
    </DropdownMenu.Trigger>
  )
}
