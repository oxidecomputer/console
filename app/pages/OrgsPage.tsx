import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { buttonStyle, EmptyMessage, Folder24Icon, TableActions } from '@oxide/ui'
import { useQuickActions } from '../hooks'
import { DateCell, linkCell, useQueryTable } from '@oxide/table'
import { useApiQuery } from '@oxide/api'

const EmptyState = () => (
  <EmptyMessage
    icon={<Folder24Icon />}
    title="No organizations"
    body="You need to create an organization to be able to see it here"
    buttonText="New organization"
    buttonTo="new"
  />
)

const OrgsPage = () => {
  const { Table, Column } = useQueryTable('organizationsGet', {})

  const { data: orgs } = useApiQuery('organizationsGet', {
    limit: 10, // to have same params as QueryTable
  })

  const navigate = useNavigate()
  useQuickActions(
    useMemo(
      () => [
        { value: 'New organization', onSelect: () => navigate('new') },
        ...(orgs?.items || []).map((o) => ({
          value: o.name,
          onSelect: () => navigate(o.name),
          navGroup: 'Go to organization',
        })),
      ],
      [navigate, orgs]
    )
  )

  return (
    <>
      <TableActions>
        <Link to="new" className={buttonStyle({ variant: 'secondary', size: 'xs' })}>
          New Organization
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />}>
        <Column accessor="name" cell={linkCell((name) => `/orgs/${name}`)} />
        <Column accessor="description" />
        <Column accessor="timeModified" header="Last updated" cell={DateCell} />
      </Table>
    </>
  )
}

export default OrgsPage
