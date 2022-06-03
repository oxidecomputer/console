import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  buttonStyle,
  EmptyMessage,
  Folder24Icon,
  PageHeader,
  PageTitle,
  TableActions,
} from '@oxide/ui'
import { useQuickActions } from '../hooks'
import type { MenuAction } from '@oxide/table'
import { DateCell, linkCell, useQueryTable } from '@oxide/table'
import type { Organization } from '@oxide/api'
import { useApiQueryClient } from '@oxide/api'
import { useApiMutation, useApiQuery } from '@oxide/api'

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
  const queryClient = useApiQueryClient()
  const { Table, Column } = useQueryTable('organizationsGet', {})

  const { data: orgs } = useApiQuery('organizationsGet', {
    limit: 10, // to have same params as QueryTable
  })

  const deleteOrg = useApiMutation('organizationsDeleteOrganization', {
    onSuccess() {
      queryClient.invalidateQueries('organizationsGet', {})
    },
  })

  const makeActions = (org: Organization): MenuAction[] => [
    {
      label: 'Delete',
      onActivate: () => {
        deleteOrg.mutate({ orgName: org.name })
      },
    },
  ]

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
      <PageHeader>
        <PageTitle icon={<Folder24Icon />}>Organizations</PageTitle>
      </PageHeader>
      <TableActions>
        <Link to="new" className={buttonStyle({ variant: 'secondary', size: 'xs' })}>
          New Organization
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column accessor="name" cell={linkCell((name) => `/orgs/${name}`)} />
        <Column accessor="description" />
        <Column accessor="timeModified" header="Last updated" cell={DateCell} />
      </Table>
    </>
  )
}

export default OrgsPage
