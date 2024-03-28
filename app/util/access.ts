/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { IdentityType, RoleKey } from '~/api'
import type { BadgeColor } from '~/ui/lib/Badge'

export const identityTypeLabel: Record<IdentityType, string> = {
  silo_group: 'Group',
  silo_user: 'User',
}

export const roleColor: Record<RoleKey, BadgeColor> = {
  admin: 'default',
  collaborator: 'purple',
  viewer: 'blue',
}
