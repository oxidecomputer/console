/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { type ReactNode } from 'react'

import { More12Icon } from '@oxide/design-system/icons/react'

import * as DropdownMenu from '~/ui/lib/DropdownMenu'

interface MoreActionsMenuProps {
  /** The accessible name for the menu button */
  label: string
  isSmall?: boolean
  /** Dropdown items only */
  children?: ReactNode
}

export const MoreActionsMenu = ({
  label,
  isSmall = false,
  children,
}: MoreActionsMenuProps) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={label}
        className={cn(
          'active-clicked flex items-center justify-center rounded border border-default hover:bg-tertiary',
          isSmall ? 'h-6 w-6' : 'h-8 w-8'
        )}
      >
        <More12Icon />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="mt-2">{children}</DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
