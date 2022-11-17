import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo } from 'react'

import type { Group } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Table } from '@oxide/table'
import { Settings24Icon } from '@oxide/ui'

import { FullPageForm, TextField } from 'app/components/form'

const colHelper = createColumnHelper<Group>()

const columns = [
  colHelper.accessor('id', { header: 'ID' }),
  colHelper.accessor('displayName', { header: 'Name' }),
]

export function ProfilePage() {
  const { data: user } = useApiQuery('sessionMe', {})
  const { data: groups } = useApiQuery('sessionMeGroups', {})

  const groupRows = useMemo(() => groups?.items || [], [groups])

  const groupsTable = useReactTable({
    columns,
    data: groupRows,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <FullPageForm
      id="profile-form"
      title="Profile"
      formOptions={{
        defaultValues: {
          id: user?.id,
        },
      }}
      icon={<Settings24Icon />}
      submitError={null}
      onSubmit={() => Promise.resolve()}
    >
      {({ control }) => (
        <>
          <TextField
            name="id"
            label="User ID"
            required
            disabled
            fieldClassName="!cursor-default"
            value={user?.id}
            control={control}
          />
          <h2>Groups</h2>
          <Table table={groupsTable} />
          <span className="inline-block text-secondary">
            <span>Your user information is managed by your organization. </span>
            <span className="md+:block">
              To update, contact your{' '}
              <a className="external-link" href="#/">
                IDP admin
              </a>
              .
            </span>
          </span>
        </>
      )}
    </FullPageForm>
  )
}
