/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Link, Outlet } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import { DateCell, linkCell, useQueryTable } from '@oxide/table'
import {
  buttonStyle,
  EmptyMessage,
  Message,
  Networking24Icon,
  PageHeader,
  PageTitle,
  TableActions,
} from '@oxide/ui'

import { pb } from 'app/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No IP pools"
    body="You need to create an IP pool to be able to see it here"
    buttonText="New IP pool"
    buttonTo={pb.ipPoolNew()}
  />
)

IpPoolsPage.loader = async function () {
  await apiQueryClient.prefetchQuery('ipPoolList', { query: { limit: 25 } })
  return null
}

export function IpPoolsPage() {
  const { Table, Column } = useQueryTable('ipPoolList', {})
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>IP pools</PageTitle>
      </PageHeader>
      <Message
        className="-mt-8 mb-20"
        variant="info"
        content="This page is a work in progress. Use the CLI or API for full control over pools, IP ranges, and linked silos."
      />
      <TableActions>
        <Link to={pb.ipPoolNew()} className={buttonStyle({ size: 'sm' })}>
          New IP Pool
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />}>
        <Column accessor="name" cell={linkCell((pool) => pb.ipPool({ pool }))} />
        <Column accessor="description" />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
