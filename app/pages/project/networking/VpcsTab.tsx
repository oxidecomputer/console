/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'
import { Link, Outlet, useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type Vpc,
} from '@oxide/api'
import { DateCell, linkCell, useQueryTable, type MenuAction } from '@oxide/table'
import { buttonStyle, EmptyMessage, Networking24Icon } from '@oxide/ui'

import { getProjectSelector, useProjectSelector, useQuickActions } from 'app/hooks'
import { confirmDelete } from 'app/stores/confirm-delete'
import { pb } from 'app/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No VPCs"
    body="You need to create a VPC to be able to see it here"
    buttonText="New VPC"
    buttonTo={pb.vpcNew(useProjectSelector())}
  />
)

// just as in the vpcList call for the quick actions menu, include limit: 25 to make
// sure it matches the call in the QueryTable
VpcsTab.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('vpcList', {
    query: { ...getProjectSelector(params), limit: 25 },
  })
  return null
}

export function VpcsTab() {
  const queryClient = useApiQueryClient()
  const projectSelector = useProjectSelector()
  const { data: vpcs } = usePrefetchedApiQuery('vpcList', {
    query: { ...projectSelector, limit: 25 }, // to have same params as QueryTable
  })
  const navigate = useNavigate()

  const deleteVpc = useApiMutation('vpcDelete', {
    onSuccess() {
      queryClient.invalidateQueries('vpcList')
    },
  })

  const makeActions = (vpc: Vpc): MenuAction[] => [
    {
      label: 'Edit',
      onActivate() {
        navigate(pb.vpcEdit({ ...projectSelector, vpc: vpc.name }), { state: vpc })
      },
    },
    {
      label: 'Delete',
      onActivate: confirmDelete({
        doDelete: () =>
          deleteVpc.mutateAsync({ path: { vpc: vpc.name }, query: projectSelector }),
        label: vpc.name,
      }),
    },
  ]

  useQuickActions(
    useMemo(
      () =>
        vpcs.items.map((v) => ({
          value: v.name,
          onSelect: () => navigate(pb.vpc({ ...projectSelector, vpc: v.name })),
          navGroup: 'Go to VPC',
        })),
      [projectSelector, vpcs, navigate]
    )
  )

  const { Table, Column } = useQueryTable('vpcList', { query: projectSelector })
  return (
    <>
      <div className="mb-3 flex justify-end space-x-2">
        <Link to={pb.vpcNew(projectSelector)} className={buttonStyle({ size: 'sm' })}>
          New Vpc
        </Link>
      </div>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column
          accessor="name"
          cell={linkCell((vpc) => pb.vpc({ ...projectSelector, vpc }))}
        />
        <Column accessor="dnsName" header="DNS name" />
        <Column accessor="description" />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}