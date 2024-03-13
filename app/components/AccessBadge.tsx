/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { RoleKey } from '~/api'
import { Badge } from '~/ui/lib/Badge'
import { getBadgeColor } from '~/util/access'

type AccessBadgeProps = { labelPrefix: 'silo' | 'project'; role: RoleKey }

export const AccessBadge = ({ labelPrefix, role }: AccessBadgeProps) => (
  <Badge color={getBadgeColor(role)}>
    {labelPrefix}.{role}
  </Badge>
)
