import { useMemo } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { Link, useNavigate } from 'react-router-dom'

import type { Project } from '@oxide/api'
import { apiQueryClient } from '@oxide/api'
import { useApiMutation, useApiQuery, useApiQueryClient } from '@oxide/api'
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

import { requireOrgParams, useOrgParams, useOrgSelector, useQuickActions } from '../hooks'

const EmptyState = () => (
  <EmptyMessage
    icon={<Folder24Icon />}
    title="No projects"
    body="You need to create a project to be able to see it here"
    buttonText="New project"
    buttonTo={pb.projectNew(useOrgParams())}
  />
)

ProjectsPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { orgName } = requireOrgParams(params)
  await apiQueryClient.prefetchQuery('projectListV1', {
    query: { organization: orgName, limit: 10 },
  })
  return null
}

export default function ProjectsPage() {
  const navigate = useNavigate()

  const queryClient = useApiQueryClient()
  const { orgName } = useOrgParams()
  const orgSelector = useOrgSelector()
  const { Table, Column } = useQueryTable('projectListV1', { query: orgSelector })

  const { data: projects } = useApiQuery('projectListV1', {
    query: { ...orgSelector, limit: 10 }, // limit to match QueryTable
  })

  const deleteProject = useApiMutation('projectDeleteV1', {
    onSuccess() {
      // TODO: figure out if this is invalidating as expected, can we leave out the query
      // altogether, etc. Look at whether limit param matters.
      queryClient.invalidateQueries('projectListV1', { query: { organization: orgName } })
    },
  })

  const makeActions = (project: Project): MenuAction[] => [
    {
      label: 'Edit',
      onActivate: () => {
        const path = { orgName, projectName: project.name }
        // the edit view has its own loader, but we can make the modal open
        // instantaneously by preloading the fetch result
        apiQueryClient.setQueryData(
          'projectViewV1',
          {
            path: { project: project.name },
            query: orgSelector,
          },
          project
        )
        navigate(pb.projectEdit(path))
      },
    },
    {
      label: 'Delete',
      onActivate: () => {
        deleteProject.mutate({
          path: { project: project.name },
          query: orgSelector,
        })
      },
    },
  ]

  useQuickActions(
    useMemo(
      () => [
        { value: 'New project', onSelect: () => navigate(pb.projectNew({ orgName })) },
        ...(projects?.items || []).map((p) => ({
          value: p.name,
          onSelect: () => navigate(pb.instances({ orgName, projectName: p.name })),
          navGroup: 'Go to project',
        })),
      ],
      [orgName, navigate, projects]
    )
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Folder24Icon />}>Projects</PageTitle>
      </PageHeader>
      <TableActions>
        <Link to={pb.projectNew({ orgName })} className={buttonStyle({ size: 'sm' })}>
          New Project
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column
          accessor="name"
          cell={linkCell((projectName) => pb.instances({ orgName, projectName }))}
        />
        <Column accessor="description" />
        <Column accessor="timeModified" header="Last updated" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
