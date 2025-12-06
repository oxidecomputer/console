/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { IdentityType, RoleKey, RoleSource } from '@oxide/api'

export type IdentityFilter = 'all' | 'users' | 'groups'

export type AccessRowBase = {
  id: string
  identityType: IdentityType
  name: string
}

export type ProjectAccessRow = AccessRowBase & {
  projectRole: RoleKey | undefined
  roleBadges: { roleSource: RoleSource; roleName: RoleKey }[]
}

export type SiloAccessRow = AccessRowBase & {
  siloRole: RoleKey | undefined
  effectiveRole: RoleKey
}
