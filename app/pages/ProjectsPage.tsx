import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useParams, useQuickActions } from '../hooks'
import { DateCell, linkCell, useQueryTable } from '@oxide/table'
import { useApiQuery } from '@oxide/api'
import { buttonStyle } from '@oxide/ui'

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
      <div className="-mt-11 mb-3 flex justify-end space-x-4">
        <Link
          to={`/orgs/${orgName}/projects/new`}
          className={buttonStyle({ size: 'xs', variant: 'secondary' })}
        >
          New Project
        </Link>
      </div>
      <Table>
        <Column
          id="name"
          cell={linkCell((name) => `/orgs/${orgName}/projects/${name}`)}
        />
        <Column id="description" />
        <Column id="timeModified" header="Last updated" cell={DateCell} />
      </Table>
    </>
  )
}

export default ProjectsPage
