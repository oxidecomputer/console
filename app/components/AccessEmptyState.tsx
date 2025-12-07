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
import { identityFilterLabel } from '~/util/access'

type AccessEmptyStateProps = {
  onClick: () => void
  scope: RoleSource
  filter: IdentityFilter
}

export const AccessEmptyState = ({
  onClick,
  scope,
  filter = 'all',
}: AccessEmptyStateProps) => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<Access24Icon />}
      title={`No authorized ${filter === 'all' ? 'users or groups' : filter}`}
      body={`Give permission to view, edit, or administer this ${scope}`}
      buttonText={`Add ${identityFilterLabel[filter]} to ${scope}`}
      onClick={onClick}
    />
  </TableEmptyBox>
)
