/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'

import type { Group } from '@oxide/api'
import { Settings24Icon } from '@oxide/design-system/icons/react'

import { useCurrentUser } from '~/layouts/AuthenticatedLayout'
import { getActionsCol } from '~/table/columns/action-col'
import { Table } from '~/table/Table'
import { CopyToClipboard } from '~/ui/lib/CopyToClipboard'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { TableTitle } from '~/ui/lib/Table'

const colHelper = createColumnHelper<Group>()

const columns = [
  colHelper.accessor('displayName', { header: 'Name' }),
  // use _row to prevent eslint from complaining about the unused variable
  getActionsCol((_row: Group) => []),
]

export function ProfilePage() {
  const { me, myGroups } = useCurrentUser()

  const groupsTable = useReactTable({
    columns,
    data: myGroups.items,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Settings24Icon />}>Profile</PageTitle>
      </PageHeader>

      <PropertiesTable className="-mt-8 mb-16">
        <PropertiesTable.Row label="Display name">{me.displayName}</PropertiesTable.Row>
        <PropertiesTable.Row label="User ID">
          {me.id}
          <CopyToClipboard className="ml-2" text={me.id} />
        </PropertiesTable.Row>
      </PropertiesTable>

      <TableTitle id="groups-label" className="mb-4">
        Groups
      </TableTitle>
      <Table table={groupsTable} aria-labelledby="groups-label" />
      <p className="inline-block max-w-md text-sans-md text-secondary">
        Your user information is managed by your organization.{' '}
        <span className="md+:block">
          To update your information, contact your administrator.
        </span>
      </p>
    </>
  )
}
