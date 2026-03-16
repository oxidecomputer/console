/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'

import {
  api,
  deleteRole,
  getListQFn,
  q,
  queryClient,
  rolesByIdFromPolicy,
  useApiMutation,
  usePrefetchedQuery,
  type Group,
} from '@oxide/api'
import { PersonGroup24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { GroupMembersSideModal } from '~/components/access/GroupMembersSideModal'
import { HL } from '~/components/HL'
import { SiloAccessEditUserSideModal } from '~/forms/silo-access'
import { titleCrumb } from '~/hooks/use-crumbs'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { ButtonCell } from '~/table/cells/LinkCell'
import { MemberCountCell } from '~/table/cells/MemberCountCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { roleColor } from '~/util/access'

const policyView = q(api.policyView, {})
const groupList = getListQFn(api.groupList, {})

export async function clientLoader() {
  await Promise.all([
    queryClient.prefetchQuery(policyView),
    queryClient.prefetchQuery(groupList.optionsFn()),
  ])
  return null
}

export const handle = titleCrumb('Groups')

const colHelper = createColumnHelper<Group>()

const GroupEmptyState = () => (
  <EmptyMessage
    icon={<PersonGroup24Icon />}
    title="No groups"
    body="No groups have been added to this silo"
  />
)

export default function SiloUsersAndGroupsGroupsTab() {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)

  const { data: siloPolicy } = usePrefetchedQuery(policyView)

  const { mutateAsync: updatePolicy } = useApiMutation(api.policyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('policyView')
      addToast({ content: 'Role updated' })
    },
  })

  const siloRoleById = useMemo(() => rolesByIdFromPolicy(siloPolicy), [siloPolicy])

  const siloRoleCol = useMemo(
    () =>
      colHelper.display({
        id: 'siloRole',
        header: 'Silo Role',
        cell: ({ row }) => {
          const role = siloRoleById.get(row.original.id)
          return role ? <Badge color={roleColor[role]}>silo.{role}</Badge> : <EmptyCell />
        },
      }),
    [siloRoleById]
  )

  const staticColumns = useMemo(
    () => [
      colHelper.accessor('displayName', {
        header: 'Name',
        cell: (info) => (
          <ButtonCell onClick={() => setSelectedGroup(info.row.original)}>
            {info.getValue()}
          </ButtonCell>
        ),
      }),
      siloRoleCol,
      colHelper.display({
        id: 'memberCount',
        header: 'Users',
        cell: ({ row }) => <MemberCountCell groupId={row.original.id} />,
      }),
      colHelper.accessor('timeCreated', Columns.timeCreated),
    ],
    [siloRoleCol]
  )

  const makeActions = useCallback(
    (group: Group): MenuAction[] => {
      const role = siloRoleById.get(group.id)
      return [
        { label: 'Change role', onActivate: () => setEditingGroup(group) },
        {
          label: 'Remove role',
          onActivate: confirmDelete({
            doDelete: () => updatePolicy({ body: deleteRole(group.id, siloPolicy) }),
            label: (
              <span>
                the <HL>{role}</HL> role for <HL>{group.displayName}</HL>
              </span>
            ),
          }),
          disabled: !role && 'This group has no role to remove',
        },
      ]
    },
    [siloRoleById, siloPolicy, updatePolicy]
  )

  const columns = useColsWithActions(staticColumns, makeActions)

  const { table } = useQueryTable({
    query: groupList,
    columns,
    emptyState: <GroupEmptyState />,
  })

  return (
    <>
      {table}
      {selectedGroup && (
        <GroupMembersSideModal
          group={selectedGroup}
          onDismiss={() => setSelectedGroup(null)}
          scopedPolicies={[{ scope: 'silo', policy: siloPolicy, sourceLabel: 'Assigned' }]}
        />
      )}
      {editingGroup && (
        <SiloAccessEditUserSideModal
          name={editingGroup.displayName}
          identityId={editingGroup.id}
          identityType="silo_group"
          policy={siloPolicy}
          defaultValues={{ roleName: siloRoleById.get(editingGroup.id) }}
          onDismiss={() => setEditingGroup(null)}
        />
      )}
    </>
  )
}
