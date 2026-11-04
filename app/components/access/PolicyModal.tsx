/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'

import {
  byGroupThenName,
  usePrefetchedQuery,
  type AccessScope,
  type Policy,
} from '@oxide/api'
import { Person16Icon, PersonGroup16Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { Modal } from '~/ui/lib/Modal'
import { TipIcon } from '~/ui/lib/TipIcon'
import { roleColor } from '~/util/access'
import { roleDiv } from '~/util/classed'
import { capitalize } from '~/util/str'

import { groupListAll, userListAll } from './policy-scope'

// Log-style list like the Alerts tab: rows with only a bottom border, so divs
// with explicit table roles rather than table elements. A grid with subgrid
// rows (like MiniTable) so both columns size to their widest content and the
// header lines up. The empty third track absorbs the leftover width, so rows
// (and their borders) still span the modal. Rows bleed past the modal section
// padding so the borders run edge to edge, and the cells pad back in by the
// same amount. The negative vertical margins pull the list up under the title
// bar, since the header row already has its own height.
const Table = roleDiv(
  'table',
  'text-sans-md -mx-4 -mt-4 -mb-2 grid grid-cols-[auto_auto_minmax(0,1fr)]'
)
const Row = roleDiv(
  'row',
  'border-secondary col-span-full grid h-9 grid-cols-subgrid items-center gap-8 border-b px-4'
)
const HeadCell = roleDiv('columnheader', 'text-mono-sm text-tertiary')
const Cell = roleDiv('cell', '')

/**
 * The raw role assignments in a policy, one row each. Unlike the Users and
 * Groups tabs, nothing is merged or collapsed here, so this is the policy
 * exactly as the API holds it, including any duplicate assignments for the
 * same identity. The identity lists are prefetched by the Access page loader.
 */
export function PolicyModal({
  scope,
  policy,
  onDismiss,
}: {
  scope: AccessScope
  policy: Policy
  onDismiss: () => void
}) {
  const { data: users } = usePrefetchedQuery(userListAll)
  const { data: groups } = usePrefetchedQuery(groupListAll)

  const rows = useMemo(() => {
    // Identity types never share IDs, so one map covers both. An ID can go
    // unresolved if the identity was deleted from the IdP after the assignment
    // was made, in which case we fall back to showing the ID.
    const nameById = new Map(
      [...users.items, ...groups.items].map((i) => [i.id, i.displayName])
    )
    return policy.roleAssignments
      .map((ra) => ({ ...ra, name: nameById.get(ra.identityId) }))
      .sort((a, b) =>
        byGroupThenName(
          { identityType: a.identityType, name: a.name ?? a.identityId },
          { identityType: b.identityType, name: b.name ?? b.identityId }
        )
      )
  }, [policy, users, groups])

  return (
    <Modal isOpen onDismiss={onDismiss} title={`${capitalize(scope)} policy`} width="free">
      <Modal.Body>
        <Modal.Section>
          <Table aria-label="Role assignments">
            <Row>
              <HeadCell>Actor</HeadCell>
              <HeadCell>Role</HeadCell>
            </Row>
            {rows.length === 0 ? (
              <Row>
                <Cell className="text-secondary col-span-full">No roles assigned</Cell>
              </Row>
            ) : (
              rows.map((row, i) => (
                <Row key={i}>
                  <Cell className="flex min-w-0 items-center gap-1.5">
                    {row.identityType === 'silo_group' ? (
                      <PersonGroup16Icon className="text-secondary shrink-0" />
                    ) : (
                      <Person16Icon className="text-secondary shrink-0" />
                    )}
                    {row.name ?? (
                      <>
                        <span className="truncate">{row.identityId}</span>
                        <TipIcon>
                          Can't resolve name because the{' '}
                          {row.identityType === 'silo_user' ? 'user' : 'group'} is no longer
                          in this silo
                        </TipIcon>
                      </>
                    )}
                  </Cell>
                  <Cell>
                    <Badge color={roleColor[row.roleName]}>
                      {scope}.{row.roleName}
                    </Badge>
                  </Cell>
                </Row>
              ))
            )}
          </Table>
        </Modal.Section>
      </Modal.Body>
    </Modal>
  )
}
