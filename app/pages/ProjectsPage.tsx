import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  buttonStyle,
  ActionMenu,
  PageHeader,
  PageTitle,
  Folder24Icon,
} from '@oxide/ui'
import { useActionMenuState, useParams } from '../hooks'
import { DateCell, linkCell, useQueryTable } from '@oxide/table'

const ProjectsPage = () => {
  const { orgName } = useParams('orgName')
  const { Table, Column } = useQueryTable('organizationProjectsGet', {
    orgName,
  })
  const navigate = useNavigate()
  const actionMenuProps = useActionMenuState()

  return (
    <>
      <ActionMenu
        {...actionMenuProps}
        items={[
          {
            value: 'New project',
            action: () => navigate('new'),
          },
        ]}
        ariaLabel="Projects quick actions"
      />
      <PageHeader className="mb-10">
        <PageTitle icon={<Folder24Icon title="Projects" />}>Projects</PageTitle>
        <div className="flex items-center">
          <Link
            to="new"
            className={buttonStyle({ variant: 'secondary', size: 'xs' })}
          >
            New Project
          </Link>
        </div>
      </PageHeader>
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
