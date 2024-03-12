/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { MoreActionsMenuItem } from '~/components/MoreActionsMenuItem'
import type { MenuAction } from '~/table/columns/action-col'
import { DropdownMenu } from '~/ui/lib/DropdownMenu'

import { MoreActionsTrigger } from './MoreActionsTrigger'

interface MoreActionsMenuProps {
  /** The accessible name for the menu button */
  label: string
  actions: MenuAction[]
}
export const MoreActionsMenu = ({ actions, label }: MoreActionsMenuProps) => {
  return (
    <DropdownMenu.Root>
      <MoreActionsTrigger inTable={false} label={label} />
      <DropdownMenu.Content align="end" className="mt-2">
        {actions.map((a) => (
          <MoreActionsMenuItem
            key={a.label}
            className={a.className}
            disabled={!!a.disabled}
            label={a.label}
            onActivate={a.onActivate}
          />
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
