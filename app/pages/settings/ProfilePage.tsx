import { useForm } from 'react-hook-form'
import invariant from 'tiny-invariant'

import type { Group } from '@oxide/api'
import { apiQueryClient, useApiQuery } from '@oxide/api'
import { Table, createColumnHelper, useReactTable } from '@oxide/table'
import { Settings24Icon } from '@oxide/ui'

import { FullPageForm, TextField } from 'app/components/form'

const colHelper = createColumnHelper<Group>()

const columns = [
  colHelper.accessor('id', { header: 'ID' }),
  colHelper.accessor('displayName', { header: 'Name' }),
]

ProfilePage.loader = async () => {
  await Promise.all([
    apiQueryClient.prefetchQuery('currentUserView', {}),
    apiQueryClient.prefetchQuery('currentUserGroups', {}),
  ])
  return null
}

export function ProfilePage() {
  const { data: user } = useApiQuery('currentUserView', {})
  invariant(user, 'User must be prefetched in a loader')

  const { data: groups } = useApiQuery('currentUserGroups', {})
  invariant(groups, 'Groups must be prefetched in a loader')

  const groupsTable = useReactTable({ columns, data: groups.items })

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
