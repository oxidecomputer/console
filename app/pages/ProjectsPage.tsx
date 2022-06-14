import { useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import type { Project } from '@oxide/api'
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

import { useParams, useQuickActions } from '../hooks'

const EmptyState = () => (
  <EmptyMessage
    icon={<Folder24Icon />}
    title="No projects"
    body="You need to create a project to be able to see it here"
    buttonText="New project"
    buttonTo="new"
  />
)

interface ProjectsPageProps {
  modal?: 'createProject' | 'editProject'
}

const ProjectsPage = ({ modal }: ProjectsPageProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  const queryClient = useApiQueryClient()
  const { orgName } = useParams('orgName')
  const { Table, Column } = useQueryTable('organizationProjectsGet', {
    orgName,
  })

  const { data: projects } = useApiQuery('organizationProjectsGet', {
    orgName,
    limit: 10, // to have same params as QueryTable
  })

  const deleteProject = useApiMutation('organizationProjectsDeleteProject', {
    onSuccess() {
      queryClient.invalidateQueries('organizationProjectsGet', { orgName })
    },
  })

  const makeActions = (project: Project): MenuAction[] => [
    {
      label: 'Edit',
      onActivate: () => {
        navigate(`./edit/${project.name}`, { state: project })
      },
    },
    {
      label: 'Delete',
      onActivate: () => {
        deleteProject.mutate({ orgName, projectName: project.name })
      },
    },
  ]

  useQuickActions(
    useMemo(
      () => [
        { value: 'New project', onSelect: () => navigate('new') },
        ...(projects?.items || []).map((p) => ({
          value: p.name,
          onSelect: () => navigate(p.name),
          navGroup: 'Go to project',
        })),
      ],
      [navigate, projects]
    )
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Folder24Icon />}>Projects</PageTitle>
      </PageHeader>
      <TableActions>
        <Link to="new" className={buttonStyle({ variant: 'secondary', size: 'xs' })}>
          New Project
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column
          accessor="name"
          cell={linkCell((name) => `/orgs/${orgName}/projects/${name}`)}
        />
        <Column accessor="description" />
        <Column accessor="timeModified" header="Last updated" cell={DateCell} />
      </Table>
      <CreateProjectSideModalForm
        isOpen={modal === 'createProject'}
        onDismiss={() => navigate('..')}
      />
      <EditProjectSideModalForm
        isOpen={modal === 'editProject'}
        onDismiss={() => navigate('../..')}
        initialValues={location.state}
      />
    </>
  )
}

export default ProjectsPage
