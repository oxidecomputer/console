import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useParams, useQuickActions } from '../hooks'
import type { MenuAction } from '@oxide/table'
import { DateCell, linkCell, useQueryTable } from '@oxide/table'
import type { Project } from '@oxide/api'
import { useApiMutation, useApiQuery, useApiQueryClient } from '@oxide/api'
import {
  TableActions,
  EmptyMessage,
  Folder24Icon,
  PageHeader,
  PageTitle,
  Button,
} from '@oxide/ui'
import CreateProjectSideModalForm from 'app/forms/project-create'

const EmptyState = () => (
  <EmptyMessage
    icon={<Folder24Icon />}
    title="No projects"
    body="You need to create a project to be able to see it here"
    buttonText="New project"
    buttonTo="new"
  />
)

const ProjectsPage = () => {
  const [showProjectCreate, setShowProjectCreate] = useState(false)
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
      label: 'Delete',
      onActivate: () => {
        deleteProject.mutate({ orgName, projectName: project.name })
      },
    },
  ]

  const navigate = useNavigate()
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
        <Button variant="secondary" size="xs" onClick={() => setShowProjectCreate(true)}>
          New Project
        </Button>
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
        isOpen={showProjectCreate}
        onDismiss={() => setShowProjectCreate(false)}
      />
    </>
  )
}

export default ProjectsPage
