/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { RoleScope } from '@oxide/api'
import { Access24Icon } from '@oxide/design-system/icons/react'

import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableEmptyBox } from '~/ui/lib/Table'

const titleMap = {
  all: 'No authorized users or groups',
  users: 'No authorized users',
  groups: 'No authorized groups',
} as const

const buttonTextMap = {
  project: {
    all: 'Add user or group to project',
    users: 'Add user to project',
    groups: 'Add group to project',
  },
  silo: {
    all: 'Add user or group',
    users: 'Add user',
    groups: 'Add group',
  },
} as const

type AccessEmptyStateProps = {
  onClick: () => void
  scope: RoleScope
  filter?: 'all' | 'users' | 'groups'
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
      buttonText={buttonTextMap[scope][filter]}
      onClick={onClick}
    />
  </TableEmptyBox>
)
