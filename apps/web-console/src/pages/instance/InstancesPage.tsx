import React from 'react'
import 'twin.macro'
import { useParams, Link } from 'react-router-dom'
import filesize from 'filesize'

import { useApiQuery } from '@oxide/api'
import { Button, Table } from '@oxide/ui'
import { StatusBadge } from '../../components/StatusBadge'
import { timeAgoAbbr } from '../../util/date'

type Params = {
  projectName: string
}

const InstancesPage = () => {
  const { projectName } = useParams<Params>()
  const { data: instances } = useApiQuery(
    'apiProjectInstancesGet',
    { projectName },
    { refetchInterval: 5000 }
  )

  if (!instances) return <div>loading</div>

  return (
    <>
      {instances.items.length > 0 && (
        <Table
          tw="h-80"
          itemSize={() => 44}
          columns={[
            { Header: 'Name', accessor: 'name' },
            { Header: 'CPU, RAM / Image', accessor: 'size' },
            { Header: 'Status', accessor: 'runState' },
            { Header: 'Created', accessor: 'created' },
          ]}
          data={instances.items.map((i) => ({
            name: (
              <Link to={`/projects/${projectName}/instances/${i.name}`}>
                {i.name}
              </Link>
            ),
            size: `${i.ncpus} vCPUs, ${filesize(i.memory)}`,
            runState: (
              <span tw="inline-flex">
                <StatusBadge tw="mr-2" size="sm" status={i.runState} />
                <abbr
                  tw="text-xs no-underline!"
                  title={i.timeRunStateUpdated.toLocaleString()}
                >
                  {timeAgoAbbr(i.timeRunStateUpdated)}
                </abbr>
              </span>
            ),
            created: i.timeCreated.toLocaleString(),
          }))}
        />
      )}
      {instances.items.length === 0 && <div tw="mt-4">No instances yet!</div>}
      <Link tw="block mt-4" to={`/projects/${projectName}/instances/new`}>
        <Button>Create instance</Button>
      </Link>
    </>
  )
}

export default InstancesPage
