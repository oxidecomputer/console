/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'

import type { Group } from '@oxide/api'
import { Table, createColumnHelper, useReactTable } from '@oxide/table'
import { Settings24Icon } from '@oxide/ui'

import { FullPageForm, TextField } from 'app/components/form'
import { useCurrentUser } from 'app/layouts/AuthenticatedLayout'

const colHelper = createColumnHelper<Group>()

const columns = [
  colHelper.accessor('id', { header: 'ID' }),
  colHelper.accessor('displayName', { header: 'Name' }),
]

export function ProfilePage() {
  const { me, myGroups } = useCurrentUser()

  const groupsTable = useReactTable({ columns, data: myGroups.items })

  const form = useForm({
    mode: 'all',
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
