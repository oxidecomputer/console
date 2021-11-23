import React from 'react'
import { Table } from '@oxide/ui'
import { useApiQuery } from '@oxide/api'
import { useParams } from '../../../../hooks'
import { useTable } from 'react-table'

const columns = [
  {
    accessor: (vpc) => vpc.identity.name,
    id: 'name',
    Header: () => <div className="text-left mx-4">Name</div>,
    Cell: ({ value }: { value: string }) => <div className="mx-4">{value}</div>,
  },
  {
    accessor: (vpc) => [vpc.ipv4Block, vpc.ipv6bBlock],
    id: 'ip-block',
    Header: () => <div className="text-left mx-4">IP Block</div>,
    Cell: ({ value }: { value: string }) => <div className="mx-4">{value}</div>,
  },
]

export const VpcSubnetsTab = () => {
  const { orgName, projectName } = useParams('orgName', 'projectName')
  console.log({ orgName, projectName })
  const { data } = useApiQuery('vpcSubnetsGet', {
    organizationName: orgName,
    projectName: projectName,
    vpcName: 'default',
  })

  console.log('data', data)

  const table = useTable({ columns, data: data?.items || [] })

  if (!data) return <div>loading</div>

  return <Table table={table} />
}
