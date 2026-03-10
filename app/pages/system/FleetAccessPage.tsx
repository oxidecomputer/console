/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'

import {
  api,
  byGroupThenName,
  deleteRole,
  getEffectiveRole,
  q,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  useUserRows,
  type FleetRole,
  type IdentityType,
} from '@oxide/api'
import { Access16Icon, Access24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { DocsPopover } from '~/components/DocsPopover'
import { HL } from '~/components/HL'
import {
  FleetAccessAddUserSideModal,
  FleetAccessEditUserSideModal,
} from '~/forms/fleet-access'
import { useCurrentUser } from '~/hooks/use-current-user'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { getActionsCol } from '~/table/columns/action-col'
import { Table } from '~/table/Table'
import { CreateButton } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions, TableEmptyBox } from '~/ui/lib/Table'
import { TipIcon } from '~/ui/lib/TipIcon'
import { identityTypeLabel, roleColor } from '~/util/access'
import { groupBy } from '~/util/array'
import { ALL_ISH } from '~/util/consts'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

const EmptyState = ({ onClick }: { onClick: () => void }) => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<Access24Icon />}
      title="No fleet access"
      body="Give permission to view, edit, or administer this fleet."
      buttonText="Add user or group"
      onClick={onClick}
    />
  </TableEmptyBox>
)

const systemPolicyView = q(api.systemPolicyView, {})
const userList = q(api.userList, {})
const groupList = q(api.groupList, {})
const siloList = q(api.siloList, { query: { limit: ALL_ISH } })

export async function clientLoader() {
  await Promise.all([
    queryClient.prefetchQuery(systemPolicyView),
    // used to resolve user names
    queryClient.prefetchQuery(userList),
    queryClient.prefetchQuery(groupList),
    queryClient.prefetchQuery(siloList),
  ])
  return null
}

export const handle = { crumb: 'Fleet Access' }

type AssignmentRow = {
  kind: 'assignment'
  id: string
  identityType: IdentityType
  name: string
  fleetRole: FleetRole
}

type MappingRow = {
  kind: 'mapping'
  siloName: string
  siloRole: string
  fleetRole: FleetRole
}

type AccessRow = AssignmentRow | MappingRow

const colHelper = createColumnHelper<AccessRow>()

export default function FleetAccessPage() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingUserRow, setEditingUserRow] = useState<AssignmentRow | null>(null)

  const navigate = useNavigate()
  const { me } = useCurrentUser()
  const { data: fleetPolicy } = usePrefetchedQuery(systemPolicyView)
  const { data: silos } = usePrefetchedQuery(siloList)
  const fleetRows = useUserRows(fleetPolicy.roleAssignments, 'fleet')

  const assignmentRows: AssignmentRow[] = useMemo(() => {
    return groupBy(fleetRows, (u) => u.id)
      .map(([userId, userAssignments]) => {
        const { name, identityType } = userAssignments[0]
        // non-null: userAssignments is non-empty (groupBy only creates groups for existing items)
        // getEffectiveRole needed because API allows multiple fleet role assignments for the same user, even though that's probably rare
        const fleetRole = getEffectiveRole(userAssignments.map((a) => a.roleName))!
        return { kind: 'assignment' as const, id: userId, identityType, name, fleetRole }
      })
      .sort(byGroupThenName)
  }, [fleetRows])

  const mappingRows: MappingRow[] = useMemo(
    () =>
      silos.items
        .filter((s) => Object.keys(s.mappedFleetRoles).length > 0)
        .flatMap((silo) =>
          Object.entries(silo.mappedFleetRoles).flatMap(([siloRole, fleetRoles]) =>
            fleetRoles.map((fleetRole) => ({
              kind: 'mapping' as const,
              siloName: silo.name,
              siloRole,
              fleetRole,
            }))
          )
        ),
    [silos]
  )

  const rows: AccessRow[] = useMemo(
    () => [...assignmentRows, ...mappingRows],
    [assignmentRows, mappingRows]
  )

  const { mutateAsync: updatePolicy } = useApiMutation(api.systemPolicyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('systemPolicyView')
      addToast({ content: 'Access removed' })
    },
  })

  const columns = useMemo(
    () => [
      colHelper.display({
        id: 'name',
        header: 'Name',
        cell: (info) => {
          const row = info.row.original
          if (row.kind === 'assignment') return row.name
          return (
            <span className="flex items-center gap-1.5">
              <Badge color={roleColor[row.siloRole as FleetRole] || 'default'}>
                silo.{row.siloRole}
              </Badge>{' '}
              in{' '}
              <Link
                className="link-with-underline"
                to={pb.siloFleetRoles({ silo: row.siloName })}
              >
                {row.siloName}
              </Link>
            </span>
          )
        },
      }),
      colHelper.display({
        id: 'type',
        header: 'Type',
        cell: (info) => {
          const row = info.row.original
          if (row.kind === 'assignment') return identityTypeLabel[row.identityType]
          return (
            <span className="flex items-center">
              Role mapping
              <TipIcon className="ml-1.5">
                <code>mapped_fleet_roles</code> on the silo grants fleet roles to users with
                certain silo roles
              </TipIcon>
            </span>
          )
        },
      }),
      colHelper.accessor('fleetRole', {
        header: 'Fleet role',
        cell: (info) => {
          const role = info.getValue()
          return <Badge color={roleColor[role]}>fleet.{role}</Badge>
        },
      }),
      getActionsCol((row: AccessRow) => {
        if (row.kind === 'mapping') {
          return [
            {
              label: 'View silo',
              onActivate: () => navigate(pb.siloFleetRoles({ silo: row.siloName })),
            },
          ]
        }
        return [
          {
            label: 'Change role',
            onActivate: () => setEditingUserRow(row),
          },
          {
            label: 'Delete',
            onActivate: confirmDelete({
              doDelete: () => updatePolicy({ body: deleteRole(row.id, fleetPolicy) }),
              label: (
                <span>
                  the <HL>{row.fleetRole}</HL> role for <HL>{row.name}</HL>
                </span>
              ),
              extraContent:
                row.id === me.id ? 'This will remove your own fleet access.' : undefined,
            }),
          },
        ]
      }),
    ],
    [fleetPolicy, updatePolicy, me, navigate]
  )

  const tableInstance = useReactTable({
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Access24Icon />}>Fleet Access</PageTitle>
        <DocsPopover
          heading="access"
          icon={<Access16Icon />}
          summary="Roles determine who can view, edit, or administer this fleet."
          links={[docLinks.keyConceptsIam, docLinks.access, docLinks.fleetRoleMappings]}
        />
      </PageHeader>

      <TableActions>
        <CreateButton onClick={() => setAddModalOpen(true)}>Add user or group</CreateButton>
      </TableActions>
      {addModalOpen && (
        <FleetAccessAddUserSideModal
          onDismiss={() => setAddModalOpen(false)}
          policy={fleetPolicy}
        />
      )}
      {editingUserRow && (
        <FleetAccessEditUserSideModal
          onDismiss={() => setEditingUserRow(null)}
          policy={fleetPolicy}
          name={editingUserRow.name}
          identityId={editingUserRow.id}
          identityType={editingUserRow.identityType}
          defaultValues={{ roleName: editingUserRow.fleetRole }}
        />
      )}
      {rows.length === 0 ? (
        <EmptyState onClick={() => setAddModalOpen(true)} />
      ) : (
        <Table table={tableInstance} />
      )}
    </>
  )
}
