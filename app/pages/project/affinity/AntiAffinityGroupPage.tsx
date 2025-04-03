/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useCallback, useState } from 'react'
import { Outlet, type LoaderFunctionArgs } from 'react-router'

import { Affinity24Icon } from '@oxide/design-system/icons/react'

import {
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type AntiAffinityGroupMember,
} from '~/api'
import { HL } from '~/components/HL'
import {
  affinityGroupList,
  antiAffinityGroupMemberList,
  antiAffinityGroupView,
  instanceList,
} from '~/forms/affinity-util'
import { AddAntiAffinityGroupMemberForm } from '~/forms/anti-affinity-group-member-add'
import { makeCrumb } from '~/hooks/use-crumbs'
import {
  getAntiAffinityGroupSelector,
  useAntiAffinityGroupSelector,
} from '~/hooks/use-params'
import { confirmAction } from '~/stores/confirm-action'
import { addToast } from '~/stores/toast'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { Badge } from '~/ui/lib/Badge'
import { CardBlock } from '~/ui/lib/CardBlock'
import { CreateButton } from '~/ui/lib/CreateButton'
import { Divider } from '~/ui/lib/Divider'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { TableEmptyBox } from '~/ui/lib/Table'
import { pb } from '~/util/path-builder'

import { AffinityPageHeader } from './AffinityPage'

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
    queryClient.prefetchQuery(affinityGroupList({ project })),
  ])
  return null
}

const AntiAffinityGroupMemberEmptyState = () => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<Affinity24Icon />}
      title="No anti-affinity group members"
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
  // useState is at this level so the CreateButton can open the modal
  const [isModalOpen, setIsModalOpen] = useState(false)

  const makeActions = useCallback(
    (antiAffinityGroupMember: AntiAffinityGroupMember): MenuAction[] => [
      {
        label: 'Copy instance ID',
        onActivate() {
          navigator.clipboard.writeText(antiAffinityGroupMember.value.id)
        },
      },
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
        header: 'Name',
        cell: makeLinkCell((instance) => pb.instance({ project, instance })),
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

  return (
    <>
      <AffinityPageHeader name={name} />
      <PropertiesTable columns={2} className="-mt-8 mb-8">
        <PropertiesTable.Row label="type">
          <Badge>anti-affinity</Badge>
        </PropertiesTable.Row>
        <PropertiesTable.DescriptionRow description={description} />
        <PropertiesTable.Row label="policy">
          <Badge color="neutral">{policy}</Badge>
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
          <CreateButton onClick={() => setIsModalOpen(true)}>
            Add instance to group
          </CreateButton>
        </CardBlock.Header>
        <CardBlock.Body>
          {membersCount ? <Table table={table} /> : <AntiAffinityGroupMemberEmptyState />}
        </CardBlock.Body>
      </CardBlock>
      <AddAntiAffinityGroupMemberForm
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
      <Outlet />
    </>
  )
}
