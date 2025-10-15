/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Badge, type BadgeColor } from '@oxide/design-system/ui'

import type { SledPolicy, SledState } from '~/api'
import { EmptyCell } from '~/table/cells/EmptyCell'

export const SledKindBadge = ({ policy }: { policy: SledPolicy }) =>
  policy.kind === 'expunged' ? (
    <Badge color="neutral">Expunged</Badge>
  ) : (
    <Badge>In service</Badge>
  )

export const ProvisionPolicyBadge = ({ policy }: { policy: SledPolicy }) => {
  if (policy.kind === 'expunged') return <EmptyCell />
  return policy.provisionPolicy === 'provisionable' ? (
    <Badge>Provisionable</Badge>
  ) : (
    <Badge color="neutral">Not provisionable</Badge>
  )
}

const STATE_BADGE_COLORS: Record<SledState, BadgeColor> = {
  active: 'default',
  decommissioned: 'neutral',
}

export const SledStateBadge = ({ state }: { state: SledState }) => (
  <Badge color={STATE_BADGE_COLORS[state]}>{state}</Badge>
)
