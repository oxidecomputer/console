/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type AccessScope, type RoleKey } from '@oxide/api'
import { Badge } from '@oxide/design-system/ui'

import { roleColor } from '~/util/access'

type RoleBadgeProps = { scope: AccessScope | 'fleet'; roleName: RoleKey }

export const RoleBadge = ({ scope, roleName }: RoleBadgeProps) => (
  <Badge color={roleColor[roleName]}>
    {scope}.{roleName}
  </Badge>
)
