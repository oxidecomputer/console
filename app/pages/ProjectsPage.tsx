import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useParams, useQuickActions } from '../hooks'
import { DateCell, linkCell, useQueryTable } from '@oxide/table'
import { useApiQuery } from '@oxide/api'
import { buttonStyle, TableActions, EmptyMessage, Folder24Icon } from '@oxide/ui'

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
  const { orgName } = useParams('orgName')
  const { Table, Column } = useQueryTable('organizationProjectsGet', {
    orgName,
  })

  const { data: projects } = useApiQuery('organizationProjectsGet', {
    orgName,
    limit: 10, // to have same params as QueryTable
  })

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
      <TableActions>
        <Link
          to={`/orgs/${orgName}/projects/new`}
          className={buttonStyle({ size: 'xs', variant: 'secondary' })}
        >
          New Project
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />}>
        <Column id="name" cell={linkCell((name) => `/orgs/${orgName}/projects/${name}`)} />
        <Column id="description" />
        <Column id="timeModified" header="Last updated" cell={DateCell} />
      </Table>
    </>
  )
}

export default ProjectsPage
