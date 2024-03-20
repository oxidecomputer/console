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

import { TextField } from '~/components/form/fields/TextField'
import { FullPageForm } from '~/components/form/FullPageForm'
import { useForm } from '~/hooks'
import { useCurrentUser } from '~/layouts/AuthenticatedLayout'
import { getActionsCol } from '~/table/columns/action-col'
import { Table } from '~/table/Table'

const colHelper = createColumnHelper<Group>()

const columns = [
  colHelper.accessor('displayName', { header: 'Name' }),
  getActionsCol(() => []),
]

export function ProfilePage() {
  const { me, myGroups } = useCurrentUser()

  const groupsTable = useReactTable({
    columns,
    data: myGroups.items,
    getCoreRowModel: getCoreRowModel(),
  })

  const form = useForm({
    defaultValues: {
      id: me.id,
    },
  })

  return (
    <FullPageForm
      form={form}
      id="profile-form"
      title="Profile"
      icon={<Settings24Icon />}
      submitError={null}
      onSubmit={() => Promise.resolve()}
    >
      <TextField
        name="id"
        label="User ID"
        required
        disabled
        fieldClassName="!cursor-default"
        value={me.id}
        control={form.control}
      />
      <h2>Groups</h2>
      <Table table={groupsTable} />
      <span className="inline-block text-sans-md text-secondary">
        <span>Your user information is managed by your organization. </span>
        <span className="md+:block">
          To update, contact your{' '}
          <a className="external-link" href="#/">
            IDP admin
          </a>
          .
        </span>
      </span>
    </FullPageForm>
  )
}
