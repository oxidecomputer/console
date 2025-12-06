/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { RoleSource } from '@oxide/api'
import { Access24Icon } from '@oxide/design-system/icons/react'

import type { IdentityFilter } from '~/types/access'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableEmptyBox } from '~/ui/lib/Table'

import { getFilterEntityLabel } from './access/shared'

const titleMap = {
  all: 'No authorized users or groups',
  users: 'No authorized users',
  groups: 'No authorized groups',
} as const

type AccessEmptyStateProps = {
  onClick: () => void
  scope: RoleSource
  filter?: IdentityFilter
}

export const AccessEmptyState = ({
  onClick,
  scope,
  filter = 'all',
}: AccessEmptyStateProps) => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<Access24Icon />}
      title={titleMap[filter]}
      body={`Give permission to view, edit, or administer this ${scope}`}
      buttonText={`Add ${getFilterEntityLabel(filter)} to ${scope}`}
      onClick={onClick}
    />
  </TableEmptyBox>
)
