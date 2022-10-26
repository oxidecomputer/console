import { useMemo } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'

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

import CreateProjectSideModalForm from 'app/forms/project-create'
import EditProjectSideModalForm from 'app/forms/project-edit'
import { pb } from 'app/util/path-builder'

import { requireOrgParams, useOrgParams, useQuickActions } from '../hooks'

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
  await apiQueryClient.prefetchQuery('projectList', {
    path: requireOrgParams(params),
    query: { limit: 10 },
  })
}

interface ProjectsPageProps {
  modal?: 'createProject' | 'editProject'
}

export default function ProjectsPage({ modal }: ProjectsPageProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const queryClient = useApiQueryClient()
  const { orgName } = useOrgParams()
  const { Table, Column } = useQueryTable('projectList', {
    path: { orgName },
  })

  const { data: projects } = useApiQuery('projectList', {
    path: { orgName },
    query: { limit: 10 }, // to have same params as QueryTable
  })

  const deleteProject = useApiMutation('projectDelete', {
    onSuccess() {
      queryClient.invalidateQueries('projectList', { path: { orgName } })
    },
  })

  const makeActions = (project: Project): MenuAction[] => [
    {
      label: 'Edit',
      onActivate: () => {
        navigate(pb.projectEdit({ orgName, projectName: project.name }), {
          state: project,
        })
      },
    },
    {
      label: 'Delete',
      onActivate: () => {
        deleteProject.mutate({ path: { orgName, projectName: project.name } })
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

  const backToProjects = () => navigate(pb.projects({ orgName }))

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Folder24Icon />}>Projects</PageTitle>
      </PageHeader>
      <TableActions>
        <Link
          to={pb.projectNew({ orgName })}
          className={buttonStyle({ variant: 'default', size: 'sm' })}
        >
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
      <CreateProjectSideModalForm
        isOpen={modal === 'createProject'}
        onDismiss={backToProjects}
      />
      <EditProjectSideModalForm
        isOpen={modal === 'editProject'}
        onDismiss={backToProjects}
        defaultValues={location.state}
      />
    </>
  )
}
