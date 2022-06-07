import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Button,
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
import { CreateOrgSideModalForm } from 'app/forms/org-create'
import { EditOrgSideModalForm } from 'app/forms/org-edit'

const EmptyState = () => (
  <EmptyMessage
    icon={<Folder24Icon />}
    title="No organizations"
    body="You need to create an organization to be able to see it here"
    buttonText="New organization"
    buttonTo="new"
  />
)

interface OrgsPageProps {
  modal?: 'createOrg' | 'editOrg'
}

const OrgsPage = ({ modal }: OrgsPageProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  const { Table, Column } = useQueryTable('organizationsGet', {})
  const queryClient = useApiQueryClient()

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
      label: 'Edit',
      onActivate() {
        navigate(`edit/${org.name}`, { state: org })
      },
    },
    {
      label: 'Delete',
      onActivate: () => {
        deleteOrg.mutate({ orgName: org.name })
      },
    },
  ]

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
        <Button variant="secondary" size="xs" onClick={() => navigate('new')}>
          New Organization
        </Button>
      </TableActions>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column accessor="name" cell={linkCell((name) => `/orgs/${name}`)} />
        <Column accessor="description" />
        <Column accessor="timeModified" header="Last updated" cell={DateCell} />
      </Table>
      <CreateOrgSideModalForm
        isOpen={modal === 'createOrg'}
        onDismiss={() => navigate('..')}
      />
      <EditOrgSideModalForm
        isOpen={modal === 'editOrg'}
        onDismiss={() => navigate('../..')}
        initialValues={location.state}
      />
    </>
  )
}

export default OrgsPage
