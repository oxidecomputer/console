/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useCallback, useState } from 'react'
import { Outlet, useNavigate, type LoaderFunctionArgs } from 'react-router'

import { Affinity24Icon } from '@oxide/design-system/icons/react'

import {
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type AntiAffinityGroupMember,
} from '~/api'
import { AffinityDocsPopover, AffinityPolicyHeader } from '~/components/AffinityDocsPopover'
import { HL } from '~/components/HL'
import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import {
  antiAffinityGroupMemberList,
  antiAffinityGroupView,
  instanceList,
} from '~/forms/affinity-util'
import AddAntiAffinityGroupMemberForm from '~/forms/anti-affinity-group-member-add'
import { makeCrumb } from '~/hooks/use-crumbs'
import {
  getAntiAffinityGroupSelector,
  useAntiAffinityGroupSelector,
} from '~/hooks/use-params'
import { AffinityGroupPolicyBadge } from '~/pages/project/affinity/AffinityPage'
import { confirmAction } from '~/stores/confirm-action'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { Badge } from '~/ui/lib/Badge'
import { Button } from '~/ui/lib/Button'
import { CardBlock } from '~/ui/lib/CardBlock'
import { Divider } from '~/ui/lib/Divider'
import * as DropdownMenu from '~/ui/lib/DropdownMenu'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { TableEmptyBox } from '~/ui/lib/Table'
import { pb } from '~/util/path-builder'

export const handle = makeCrumb(
  (p) => p.antiAffinityGroup!,
  (p) => pb.antiAffinityGroup(getAntiAffinityGroupSelector(p))
)

const colHelper = createColumnHelper<AntiAffinityGroupMember>()

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { antiAffinityGroup, project } = getAntiAffinityGroupSelector(params)
  await Promise.all([
    queryClient.prefetchQuery(antiAffinityGroupView({ antiAffinityGroup, project })),
    queryClient.prefetchQuery(antiAffinityGroupMemberList({ antiAffinityGroup, project })),
    queryClient.prefetchQuery(instanceList({ project })),
  ])
  return null
}

const AntiAffinityGroupMemberEmptyState = () => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<Affinity24Icon />}
      title="No group members"
      body="Add an instance to the group to see it here"
    />
  </TableEmptyBox>
)

export default function AntiAffinityPage() {
  const { antiAffinityGroup, project } = useAntiAffinityGroupSelector()
  const { data: group } = usePrefetchedQuery(
    antiAffinityGroupView({ antiAffinityGroup, project })
  )
  const { id, name, description, policy, timeCreated } = group
  const { data: members } = usePrefetchedQuery(
    antiAffinityGroupMemberList({ antiAffinityGroup, project })
  )
  const membersCount = members.items.length

  const { data: instances } = usePrefetchedQuery(instanceList({ project }))
  // Construct a list of all instances not currently in this anti-affinity group.
  const availableInstances = instances.items.filter(
    (instance) => !members.items.some(({ value }) => value.name === instance.name)
  )

  const { mutateAsync: removeMember } = useApiMutation(
    'antiAffinityGroupMemberInstanceDelete',
    {
      onSuccess(_data, variables) {
        queryClient.invalidateEndpoint('antiAffinityGroupMemberList')
        queryClient.invalidateEndpoint('antiAffinityGroupView')
        addToast(<>Member <HL>{variables.path.instance}</HL> removed from anti-affinity group <HL>{group.name}</HL></>) // prettier-ignore
      },
    }
  )

  const navigate = useNavigate()

  const { mutateAsync: deleteGroup } = useApiMutation('antiAffinityGroupDelete', {
    onSuccess() {
      navigate(pb.affinity({ project }))
      queryClient.invalidateEndpoint('antiAffinityGroupList')
      addToast(<>Anti-affinity group <HL>{group.name}</HL> deleted</>) // prettier-ignore
    },
  })

  // useState is at this level so the CreateButton can open the modal
  const [isModalOpen, setIsModalOpen] = useState(false)

  const makeActions = useCallback(
    (antiAffinityGroupMember: AntiAffinityGroupMember): MenuAction[] => [
      {
        label: 'Remove from group',
        onActivate() {
          confirmAction({
            actionType: 'danger',
            doAction: () =>
              removeMember({
                path: {
                  antiAffinityGroup: antiAffinityGroup,
                  instance: antiAffinityGroupMember.value.name,
                },
                query: { project },
              }),
            modalTitle: 'Remove instance from anti-affinity group',
            modalContent: (
              <p>
                Are you sure you want to remove{' '}
                <HL>{antiAffinityGroupMember.value.name}</HL> from the anti-affinity group{' '}
                <HL>{antiAffinityGroup}</HL>?
              </p>
            ),
            errorTitle: `Error removing ${antiAffinityGroupMember.value.name}`,
          })
        },
      },
    ],
    [project, removeMember, antiAffinityGroup]
  )

  const columns = useColsWithActions(
    [
      colHelper.accessor('value.name', {
        header: 'name',
        cell: makeLinkCell((instance) => pb.instanceSettings({ project, instance })),
      }),
      colHelper.accessor('value.runState', Columns.instanceState),
      colHelper.accessor('value.id', Columns.id),
    ],
    makeActions
  )

  const table = useReactTable({
    columns,
    data: members.items,
    getCoreRowModel: getCoreRowModel(),
  })

  const disabledReason = () => {
    // https://github.com/oxidecomputer/omicron/blob/77c4136a767d4d1365c3ad715a335da9035415db/nexus/db-queries/src/db/datastore/affinity.rs#L66
    if (membersCount >= 32) {
      return 'Maximum number of members reached'
    }
    if (!instances.items.length) {
      return 'No instances available'
    }
    if (!availableInstances.length) {
      return 'All instances are already in this group'
    }
    return undefined
  }

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Affinity24Icon />}>{name}</PageTitle>
        <div className="inline-flex gap-2">
          <AffinityDocsPopover />
          <MoreActionsMenu label="Anti-affinity group actions">
            <DropdownMenu.LinkItem
              to={pb.antiAffinityGroupEdit({ project, antiAffinityGroup: name })}
            >
              Edit
            </DropdownMenu.LinkItem>
            <DropdownMenu.Item
              label="Delete"
              onSelect={confirmDelete({
                doDelete: () =>
                  deleteGroup({
                    path: { antiAffinityGroup: group.name },
                    query: { project },
                  }),
                label: group.name,
                resourceKind: 'anti-affinity group',
              })}
              className="destructive"
            />
          </MoreActionsMenu>
        </div>
      </PageHeader>
      <PropertiesTable columns={2} className="-mt-8 mb-8">
        <PropertiesTable.Row label="type">
          <Badge>anti-affinity</Badge>
        </PropertiesTable.Row>
        <PropertiesTable.DescriptionRow description={description} />
        <PropertiesTable.Row label={<AffinityPolicyHeader />}>
          <AffinityGroupPolicyBadge policy={policy} />
        </PropertiesTable.Row>
        <PropertiesTable.DateRow date={timeCreated} label="Created" />
        <PropertiesTable.Row label="Members">{membersCount}</PropertiesTable.Row>
        <PropertiesTable.IdRow id={id} />
      </PropertiesTable>
      <Divider className="mb-10" />
      <CardBlock>
        <CardBlock.Header
          title="Members"
          description="Instances in this anti-affinity group"
        >
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            disabled={!availableInstances.length}
            disabledReason={disabledReason()}
          >
            Add instance
          </Button>
        </CardBlock.Header>
        <CardBlock.Body>
          {membersCount ? <Table table={table} /> : <AntiAffinityGroupMemberEmptyState />}
        </CardBlock.Body>
      </CardBlock>
      {isModalOpen && (
        <AddAntiAffinityGroupMemberForm
          instances={availableInstances}
          onDismiss={() => setIsModalOpen(false)}
        />
      )}
      <Outlet />
    </>
  )
}
