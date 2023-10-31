/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { flattenChildren } from '@oxide/util'

import { Button, type ButtonProps } from '../button/Button'

export interface BulkActionMenuProps {
  selectedCount: number
  children: React.ReactNode
  onSelectAll: () => void
}

export function BulkActionMenu({ children, selectedCount }: BulkActionMenuProps) {
  const actionButtons = flattenChildren(children)
  return (
    <div className="flex w-fit rounded border bg-accent-secondary border-accent children:items-center children:space-x-2 children:p-3">
      <div className="flex border-r border-accent-tertiary">{actionButtons}</div>
      <div className="flex">
        <span className="text-sans-sm text-accent">{selectedCount} selected</span>
      </div>
    </div>
  )
}

BulkActionMenu.Button = (props: Omit<ButtonProps, 'size' | 'variant'>) => (
  <Button
    size="sm"
    // TODO: Remove this border once the proper button styles are available
    className="rounded border !border-accent-secondary"
    {...props}
  />
)
