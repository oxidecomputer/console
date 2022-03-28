import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { buttonStyle, PageHeader, PageTitle, Folder24Icon } from '@oxide/ui'
import { useQuickActions } from '../hooks'
import { DateCell, linkCell, useQueryTable } from '@oxide/table'
import { useApiQuery } from '@oxide/api'

const OrgsPage = () => {
  const { Table, Column } = useQueryTable('organizationsGet', {})

  const { data: orgs } = useApiQuery('organizationsGet', {
    limit: 10, // to have same params as QueryTable
  })

  const navigate = useNavigate()
  useQuickActions(
    useMemo(
      () => [
        { value: 'New organization', onSelect: () => navigate('new') },
        ...(orgs?.items || []).map((o) => ({
          value: o.name,
          onSelect: () => navigate(o.name),
          navGroup: 'Go to organization',
        })),
      ],
      [navigate, orgs]
    )
  )

  return (
    <>
      <PageHeader className="mb-10">
        <PageTitle icon={<Folder24Icon title="Organizations" />}>
          Organizations
        </PageTitle>
        <div className="flex items-center">
          <Link
            to="new"
            className={buttonStyle({ variant: 'secondary', size: 'xs' })}
          >
            New Organization
          </Link>
        </div>
      </PageHeader>
      <Table>
        <Column id="name" cell={linkCell((name) => `/orgs/${name}`)} />
        <Column id="description" />
        <Column id="timeModified" header="Last updated" cell={DateCell} />
      </Table>
    </>
  )
}

export default OrgsPage
