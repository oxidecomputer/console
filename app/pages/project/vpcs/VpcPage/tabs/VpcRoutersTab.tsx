/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useMemo } from 'react'
import { Outlet, type LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, type VpcRouter } from '@oxide/api'

import { getVpcSelector, useVpcSelector } from '~/hooks'
import { LinkCell } from '~/table/cells/LinkCell'
import { PAGE_SIZE, useQueryTable } from '~/table/QueryTable'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { pb } from '~/util/path-builder'

const colHelper = createColumnHelper<VpcRouter>()

VpcRoutersTab.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, vpc } = getVpcSelector(params)
  await apiQueryClient.prefetchQuery('vpcRouterList', {
    query: { project, vpc, limit: PAGE_SIZE },
  })
  return null
}

export function VpcRoutersTab() {
  const vpcSelector = useVpcSelector()
  const { project, vpc } = vpcSelector
  const { Table } = useQueryTable('vpcRouterList', {
    query: { project, vpc, limit: PAGE_SIZE },
  })

  const emptyState = (
    <EmptyMessage
      title="No VPC routers"
      body="Create a router to see it here"
      buttonText="New router"
      buttonTo={'adasd'}
    />
  )

  const columns = useMemo(
    () => [
      colHelper.accessor('name', {
        cell: (info) => (
          <LinkCell to={pb.vpcRouter({ ...vpcSelector, router: info.getValue() })}>
            {info.getValue()}
          </LinkCell>
        ),
      }),
    ],
    [vpcSelector]
  )

  return (
    <>
      <div className="mb-3 flex justify-end space-x-2">
        <CreateLink to={pb.vpcRoutersNew({ project, vpc })}>New router</CreateLink>
      </div>
      <Table columns={columns} emptyState={emptyState} rowHeight="large" />
      <Outlet />
    </>
  )
}
