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

import { requireOrgParams, useQuickActions, useRequiredParams } from '../hooks'

const EmptyState = () => (
  <EmptyMessage
    icon={<Folder24Icon />}
    title="No projects"
    body="You need to create a project to be able to see it here"
    buttonText="New project"
    buttonTo="new"
  />
)

ProjectsPage.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('projectList', {
    ...requireOrgParams(params),
    limit: 10,
  })
}

interface ProjectsPageProps {
  modal?: 'createProject' | 'editProject'
}

export default function ProjectsPage({ modal }: ProjectsPageProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const queryClient = useApiQueryClient()
  const { orgName } = useRequiredParams('orgName')
  const { Table, Column } = useQueryTable('projectList', {
    orgName,
  })

  const { data: projects } = useApiQuery('projectList', {
    orgName,
    limit: 10, // to have same params as QueryTable
  })

  const deleteProject = useApiMutation('projectDelete', {
    onSuccess() {
      queryClient.invalidateQueries('projectList', { orgName })
    },
  })

  const makeActions = (project: Project): MenuAction[] => [
    {
      label: 'Edit',
      onActivate: () => {
        navigate(`./${project.name}/edit`, { state: project })
      },
    },
    {
      label: 'Delete',
      onActivate: () => {
        deleteProject.mutate({ orgName, projectName: project.name })
      },
    },
  ]

  const newProjectPath = `/orgs/${orgName}/project-new`

  useQuickActions(
    useMemo(
      () => [
        { value: 'New project', onSelect: () => navigate(newProjectPath) },
        ...(projects?.items || []).map((p) => ({
          value: p.name,
          onSelect: () => navigate(`${p.name}/instances`),
          navGroup: 'Go to project',
        })),
      ],
      [navigate, projects, newProjectPath]
    )
  )

  const backToProjects = () => navigate(`/orgs/${orgName}/projects`)

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Folder24Icon />}>Projects</PageTitle>
      </PageHeader>
      <TableActions>
        <Link
          to={newProjectPath}
          className={buttonStyle({ variant: 'default', size: 'xs' })}
        >
          New Project
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column
          accessor="name"
          cell={linkCell((name) => `/orgs/${orgName}/projects/${name}/instances`)}
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
        initialValues={location.state}
      />
    </>
  )
}
