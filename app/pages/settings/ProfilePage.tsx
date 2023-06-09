import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import invariant from 'tiny-invariant'

import type { Group } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Table, createColumnHelper, useReactTable } from '@oxide/table'
import { Settings24Icon } from '@oxide/ui'

import { FullPageForm, TextField } from 'app/components/form'

const colHelper = createColumnHelper<Group>()

const columns = [
  colHelper.accessor('id', { header: 'ID' }),
  colHelper.accessor('displayName', { header: 'Name' }),
]

export function ProfilePage() {
  const { data: user } = useApiQuery('currentUserView', {})
  const { data: groups } = useApiQuery('currentUserGroups', {})

  const groupRows = useMemo(() => groups?.items || [], [groups])

  const groupsTable = useReactTable({ columns, data: groupRows })

  invariant(user, 'User must be prefetched in a loader')

  const form = useForm({
    mode: 'all',
    defaultValues: {
      id: user.id,
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
        value={user?.id}
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
