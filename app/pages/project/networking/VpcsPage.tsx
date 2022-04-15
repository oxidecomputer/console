import React, { useMemo } from 'react'
import { useParams, useQuickActions } from 'app/hooks'
import { DateCell, linkCell, useQueryTable } from '@oxide/table'
import { useApiQuery } from '@oxide/api'
import { Link, useNavigate } from 'react-router-dom'
import { buttonStyle, EmptyMessage, Networking24Icon, TableActions } from '@oxide/ui'

const EmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No VPCs"
    body="You need to create a VPC to be able to see it here"
    buttonText="New VPC"
    buttonTo="new"
  />
)

export const VpcsPage = () => {
  const projectParams = useParams('orgName', 'projectName')
  const { orgName, projectName } = projectParams
  const { data: vpcs } = useApiQuery('projectVpcsGet', {
    ...projectParams,
    limit: 10, // to have same params as QueryTable
  })
  const navigate = useNavigate()
  useQuickActions(
    useMemo(
      () =>
        (vpcs?.items || []).map((p) => ({
          value: p.name,
          onSelect: () => navigate(p.name),
          navGroup: 'Go to VPC',
        })),
      [vpcs, navigate]
    )
  )

  const { Table, Column } = useQueryTable('projectVpcsGet', projectParams)
  return (
    <>
      <TableActions>
        <Link to="new" className={buttonStyle({ variant: 'secondary', size: 'xs' })}>
          New VPC
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />}>
        <Column
          id="name"
          cell={linkCell((name) => `/orgs/${orgName}/projects/${projectName}/vpcs/${name}`)}
        />
        <Column id="dnsName" header="dns name" />
        <Column id="description" />
        <Column id="created" accessor="timeCreated" cell={DateCell} />
      </Table>
    </>
  )
}
