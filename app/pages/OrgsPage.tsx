import { useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import type { Organization } from '@oxide/api'
import { canWrite } from '@oxide/api'
import { useEffectiveSiloRole } from '@oxide/api'
import { apiQueryClient } from '@oxide/api'
import { useApiQueryClient } from '@oxide/api'
import { useApiMutation, useApiQuery } from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import { DateCell, linkCell, useQueryTable } from '@oxide/table'
import {
  Button,
  EmptyMessage,
  Folder24Icon,
  PageHeader,
  PageTitle,
  TableActions,
  buttonStyle,
} from '@oxide/ui'

import { CreateOrgSideModalForm } from 'app/forms/org-create'
import { EditOrgSideModalForm } from 'app/forms/org-edit'
import { pb } from 'app/util/path-builder'

import { useQuickActions } from '../hooks'

const EmptyState = () => (
  <EmptyMessage
    icon={<Folder24Icon />}
    title="No organizations"
    body="You need to create an organization to be able to see it here"
    buttonText="New organization"
    buttonTo={pb.orgNew()}
  />
)

OrgsPage.loader = async () => {
  await Promise.all([
    apiQueryClient.prefetchQuery('organizationList', { query: { limit: 10 } }),
    apiQueryClient.prefetchQuery('policyView', {}),
  ])
}

interface OrgsPageProps {
  modal?: 'createOrg' | 'editOrg'
}

export default function OrgsPage({ modal }: OrgsPageProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const { Table, Column } = useQueryTable('organizationList', {})
  const queryClient = useApiQueryClient()

  const siloRole = useEffectiveSiloRole()

  const { data: orgs } = useApiQuery('organizationList', {
    query: { limit: 10 }, // to have same params as QueryTable
  })

  const deleteOrg = useApiMutation('organizationDelete', {
    onSuccess() {
      queryClient.invalidateQueries('organizationList', {})
    },
  })

  const makeActions = (org: Organization): MenuAction[] => [
    {
      label: 'Edit',
      onActivate() {
        navigate(pb.orgEdit({ orgName: org.name }), { state: org })
      },
    },
    {
      label: 'Delete',
      onActivate: () => {
        deleteOrg.mutate({ path: { orgName: org.name } })
      },
    },
  ]

  useQuickActions(
    useMemo(
      () => [
        { value: 'New organization', onSelect: () => navigate(pb.orgNew()) },
        ...(orgs?.items || []).map((o) => ({
          value: o.name,
          onSelect: () => navigate(pb.org({ orgName: o.name })),
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
        {canWrite(siloRole) ? (
          <Link
            to={pb.orgNew()}
            className={buttonStyle({ variant: 'default', size: 'sm' })}
          >
            New Organization
          </Link>
        ) : (
          <Button size="sm" disabled>
            New Organization
          </Button>
        )}
      </TableActions>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column accessor="name" cell={linkCell((orgName) => pb.projects({ orgName }))} />
        <Column accessor="description" />
        <Column accessor="timeModified" header="Last updated" cell={DateCell} />
      </Table>
      <CreateOrgSideModalForm
        isOpen={modal === 'createOrg'}
        onDismiss={() => navigate(pb.orgs())}
      />
      <EditOrgSideModalForm
        isOpen={modal === 'editOrg'}
        onDismiss={() => navigate(pb.orgs())}
        initialValues={location.state}
      />
    </>
  )
}
