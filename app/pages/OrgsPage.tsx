import { useMemo } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

import type { Organization } from '@oxide/api'
import { apiQueryClient } from '@oxide/api'
import { useApiQueryClient } from '@oxide/api'
import { useApiMutation, useApiQuery } from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import { DateCell, linkCell, useQueryTable } from '@oxide/table'
import {
  EmptyMessage,
  Folder24Icon,
  PageHeader,
  PageTitle,
  TableActions,
  buttonStyle,
} from '@oxide/ui'

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
  await apiQueryClient.prefetchQuery('organizationListV1', { query: { limit: 10 } })
  return null
}

export default function OrgsPage() {
  const navigate = useNavigate()

  const { Table, Column } = useQueryTable('organizationListV1', {})
  const queryClient = useApiQueryClient()

  const { data: orgs } = useApiQuery('organizationListV1', {
    query: { limit: 10 }, // to have same params as QueryTable
  })

  const deleteOrg = useApiMutation('organizationDelete', {
    onSuccess() {
      queryClient.invalidateQueries('organizationListV1', {})
    },
  })

  const makeActions = (org: Organization): MenuAction[] => [
    {
      label: 'Edit',
      onActivate() {
        apiQueryClient.setQueryData(
          'organizationViewV1',
          { path: { organization: org.name } },
          org
        )
        navigate(pb.orgEdit({ orgName: org.name }))
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
        <Link to={pb.orgNew()} className={buttonStyle({ size: 'sm' })}>
          New Organization
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column accessor="name" cell={linkCell((orgName) => pb.projects({ orgName }))} />
        <Column accessor="description" />
        <Column accessor="timeModified" header="Last updated" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
