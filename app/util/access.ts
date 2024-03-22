/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { IdentityType } from '~/api'
import type { BadgeColor } from '~/ui/lib/Badge'

export const accessTypeLabel = (identityType: IdentityType) =>
  identityType === 'silo_group' ? 'Group' : 'User'

export const getBadgeColor = (role: 'admin' | 'collaborator' | 'viewer'): BadgeColor => {
  const badgeColor = {
    admin: 'default',
    collaborator: 'purple',
    viewer: 'blue',
  }
  return badgeColor[role] as BadgeColor
}
