/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'
import { Outlet, useNavigate, type LoaderFunctionArgs } from 'react-router'

import {
  getListQFn,
  queryClient,
  useApiMutation,
  useApiQueryClient,
  type VpcSubnet,
} from '@oxide/api'

import { getVpcSelector, useVpcSelector } from '~/hooks/use-params'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { RouterLinkCell } from '~/table/cells/RouterLinkCell'
import { TwoLineCell } from '~/table/cells/TwoLineCell'
import { getActionsCol, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

const colHelper = createColumnHelper<VpcSubnet>()

const subnetList = (params: PP.Vpc) => getListQFn('vpcSubnetList', { query: params })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project, vpc } = getVpcSelector(params)
  await queryClient.prefetchQuery(subnetList({ project, vpc }).optionsFn())
  return null
}

export const handle = { crumb: 'Subnets' }

export default function VpcSubnetsTab() {
  const vpcSelector = useVpcSelector()
  const queryClient = useApiQueryClient()

  const { mutateAsync: deleteSubnet } = useApiMutation('vpcSubnetDelete', {
    onSuccess() {
      queryClient.invalidateQueries('vpcSubnetList')
      // We only have the ID, so will show a generic confirmation message
      addToast({ content: 'Subnet deleted' })
    },
  })

  const navigate = useNavigate()

  const makeActions = useCallback(
    (subnet: VpcSubnet): MenuAction[] => [
      {
        label: 'Edit',
        onActivate: () =>
          navigate(pb.vpcSubnetsEdit({ ...vpcSelector, subnet: subnet.name })),
      },
      // TODO: only show if you have permission to do this
      {
        label: 'Delete',
        onActivate: confirmDelete({
          doDelete: () => deleteSubnet({ path: { subnet: subnet.id } }),
          label: subnet.name,
        }),
      },
    ],
    [navigate, deleteSubnet, vpcSelector]
  )

  const columns = useMemo(
    () => [
      colHelper.accessor('name', {
        cell: makeLinkCell((subnet) => pb.vpcSubnetsEdit({ ...vpcSelector, subnet })),
      }),
      colHelper.accessor('description', Columns.description),
      colHelper.accessor((vpc) => [vpc.ipv4Block, vpc.ipv6Block] as const, {
        header: 'IP Block',
        cell: (info) => <TwoLineCell value={[...info.getValue()]} />,
      }),
      colHelper.accessor('customRouterId', {
        header: 'Custom Router',
        // RouterLinkCell needed, as we need to convert the customRouterId to the custom router's name
        cell: (info) => <RouterLinkCell routerId={info.getValue()} />,
      }),
      colHelper.accessor('timeCreated', Columns.timeCreated),
      getActionsCol(makeActions),
    ],
    [vpcSelector, makeActions]
  )

  const emptyState = (
    <EmptyMessage
      title="No VPC subnets"
      body="Create a subnet to see it here"
      buttonText="New subnet"
      buttonTo={pb.vpcSubnetsNew(vpcSelector)}
    />
  )

  const { table } = useQueryTable({
    query: subnetList(vpcSelector),
    columns,
    emptyState,
    rowHeight: 'large',
  })

  return (
    <>
      <div className="mb-3 flex justify-end space-x-2">
        <CreateLink to={pb.vpcSubnetsNew(vpcSelector)}>New subnet</CreateLink>
      </div>
      {table}
      <Outlet />
    </>
  )
}
