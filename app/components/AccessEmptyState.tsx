/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Access24Icon } from '@oxide/design-system/icons/react'

import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableEmptyBox } from '~/ui/lib/Table'

type AccessEmptyStateProps = {
  onClick: () => void
  scope: 'project' | 'silo'
  filter?: 'all' | 'users' | 'groups'
}

export function AccessEmptyState({
  onClick,
  scope,
  filter = 'all',
}: AccessEmptyStateProps) {
  const titleMap = {
    all: 'No authorized users',
    users: 'No authorized users',
    groups: 'No authorized groups',
  }

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
  }

  return (
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
}
