/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper } from '@tanstack/react-table'
import { useCallback } from 'react'
import type { LoaderFunctionArgs } from 'react-router'

import { Affinity24Icon } from '@oxide/design-system/icons/react'

import {
  apiq,
  getListQFn,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type AntiAffinityGroupMember,
} from '~/api'
import { HL } from '~/components/HL'
import { makeCrumb } from '~/hooks/use-crumbs'
import {
  getAntiAffinityGroupSelector,
  useAntiAffinityGroupSelector,
  useProjectSelector,
} from '~/hooks/use-params'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { Badge } from '~/ui/lib/Badge'
import { CardBlock } from '~/ui/lib/CardBlock'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import { AffinityPageHeader } from './AffinityPage'

export const handle = makeCrumb(
  (p) => p.antiAffinityGroup!,
  (p) => pb.antiAffinityGroup(getAntiAffinityGroupSelector(p))
)

const colHelper = createColumnHelper<AntiAffinityGroupMember>()

const antiAffinityGroupView = ({ antiAffinityGroup, project }: PP.AntiAffinityGroup) =>
  apiq('antiAffinityGroupView', { path: { antiAffinityGroup }, query: { project } })
const memberList = ({ antiAffinityGroup, project }: PP.AntiAffinityGroup) =>
  getListQFn('antiAffinityGroupMemberList', {
    path: { antiAffinityGroup },
    query: { project },
  })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { antiAffinityGroup, project } = getAntiAffinityGroupSelector(params)
  await Promise.all([
    queryClient.fetchQuery(antiAffinityGroupView({ antiAffinityGroup, project })),
    queryClient.fetchQuery(memberList({ antiAffinityGroup, project }).optionsFn()),
  ])
  return null
}

const AffinityGroupMemberEmptyState = () => (
  <EmptyMessage
    icon={<Affinity24Icon />}
    title="No anti-affinity groups"
    body="Add a new anti-affinity group member to see it here"
    buttonText="Add anti-affinity group member"
    buttonTo={pb.antiAffinityGroupNew(useProjectSelector())}
  />
)

export default function AntiAffinityPage() {
  const { antiAffinityGroup, project } = useAntiAffinityGroupSelector()
  const { data: group } = usePrefetchedQuery(
    antiAffinityGroupView({ antiAffinityGroup, project })
  )
  const { id, name, description, policy, timeCreated } = group
  const { data: members } = usePrefetchedQuery(
    memberList({ antiAffinityGroup, project }).optionsFn()
  )
  // TODO: Run an ALL_ISH query to get total number of members
  const membersCount = members?.items.length ?? 0
  const staticCols = [
    colHelper.accessor('value.name', {
      header: 'Name',
      cell: makeLinkCell((instance) => pb.instance({ project, instance })),
    }),
    colHelper.accessor('value.runState', Columns.instanceState),
  ]

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

  const makeActions = useCallback(
    (antiAffinityGroupMember: AntiAffinityGroupMember) => [
      {
        disabled:
          antiAffinityGroupMember.value.runState !== 'stopped'
            ? 'Instances must be stopped before they can be removed from an anti-affinity group'
            : undefined,
        label: 'Remove',
        onActivate: confirmDelete({
          doDelete: () =>
            removeMember({
              path: {
                antiAffinityGroup: antiAffinityGroup,
                instance: antiAffinityGroupMember.value.name,
              },
              query: { project },
            }),
          // TODO: Look into adding a modalVerb prop to the confirmDelete function,
          // as right now the copy implies that the modal is for deleting the instance 🙀
          // modalVerb: 'Remove',
          label: antiAffinityGroupMember.value.name,
        }),
      },
    ],
    [project, removeMember, antiAffinityGroup]
  )

  const columns = useColsWithActions(staticCols, makeActions)
  const { table } = useQueryTable({
    query: memberList({ antiAffinityGroup, project }),
    columns,
    emptyState: <AffinityGroupMemberEmptyState />,
    getId: (member) => member.value.id,
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
      <CardBlock>
        <CardBlock.Header
          title="Members"
          description="Instances in this anti-affinity group"
        />
        <CardBlock.Body>{table}</CardBlock.Body>
      </CardBlock>
    </>
  )
}
