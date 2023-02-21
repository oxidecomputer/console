import { useMemo } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { Link, useNavigate } from 'react-router-dom'

import type { Project } from '@oxide/api'
import { apiQueryClient, useApiMutation, useApiQuery, useApiQueryClient } from '@oxide/api'
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

import { getOrgSelector, useOrgSelector, useQuickActions } from '../hooks'

const EmptyState = () => (
  <EmptyMessage
    icon={<Folder24Icon />}
    title="No projects"
    body="You need to create a project to be able to see it here"
    buttonText="New project"
    buttonTo={pb.projectNew(useOrgSelector())}
  />
)

ProjectsPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { organization } = getOrgSelector(params)
  await apiQueryClient.prefetchQuery('projectListV1', {
    query: { organization, limit: 10 },
  })
  return null
}

export default function ProjectsPage() {
  const navigate = useNavigate()

  const queryClient = useApiQueryClient()
  const { organization } = useOrgSelector()
  const { Table, Column } = useQueryTable('projectListV1', { query: { organization } })

  const { data: projects } = useApiQuery('projectListV1', {
    query: { ...{ organization }, limit: 10 }, // limit to match QueryTable
  })

  const deleteProject = useApiMutation('projectDeleteV1', {
    onSuccess() {
      // TODO: figure out if this is invalidating as expected, can we leave out the query
      // altogether, etc. Look at whether limit param matters.
      queryClient.invalidateQueries('projectListV1', { query: { organization } })
    },
  })

  const makeActions = (project: Project): MenuAction[] => [
    {
      label: 'Edit',
      onActivate: () => {
        // the edit view has its own loader, but we can make the modal open
        // instantaneously by preloading the fetch result
        apiQueryClient.setQueryData(
          'projectViewV1',
          {
            path: { project: project.name },
            query: { organization },
          },
          project
        )
        navigate(pb.projectEdit({ organization, project: project.name }))
      },
    },
    {
      label: 'Delete',
      onActivate: () => {
        deleteProject.mutate({
          path: { project: project.name },
          query: { organization },
        })
      },
    },
  ]

  useQuickActions(
    useMemo(
      () => [
        {
          value: 'New project',
          onSelect: () => navigate(pb.projectNew({ organization })),
        },
        ...(projects?.items || []).map((p) => ({
          value: p.name,
          onSelect: () => navigate(pb.instances({ organization, project: p.name })),
          navGroup: 'Go to project',
        })),
      ],
      [organization, navigate, projects]
    )
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Folder24Icon />}>Projects</PageTitle>
      </PageHeader>
      <TableActions>
        <Link to={pb.projectNew({ organization })} className={buttonStyle({ size: 'sm' })}>
          New Project
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column
          accessor="name"
          cell={linkCell((project) => pb.instances({ organization, project }))}
        />
        <Column accessor="description" />
        <Column accessor="timeModified" header="Last updated" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
