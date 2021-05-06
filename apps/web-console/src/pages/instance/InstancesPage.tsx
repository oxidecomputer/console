import React from 'react'
import { styled } from 'twin.macro'
import { useParams, Link } from 'react-router-dom'
import filesize from 'filesize'

import { useApiQuery } from '@oxide/api'
import { Button, Breadcrumbs, PageHeader, Table, TextWithIcon } from '@oxide/ui'
import { useBreadcrumbs } from '../../hooks'

const Title = styled(TextWithIcon).attrs({
  text: { variant: 'title', as: 'h1' },
  icon: { name: 'instances' },
})``

type Params = {
  projectName: string
}

const InstancesPage = () => {
  const breadcrumbs = useBreadcrumbs()

  const { projectName } = useParams<Params>()
  const { data: instances } = useApiQuery(
    'apiProjectInstancesGet',
    { projectName },
    { refetchInterval: 5000 }
  )

  if (!instances) return <div>loading</div>

  return (
    <>
      <Breadcrumbs data={breadcrumbs} />
      <PageHeader>
        <Title>Instances for Project: {projectName}</Title>
      </PageHeader>
      {instances.items.length > 0 && (
        <Table
          tw="h-80 my-3"
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
            runState: i.runState,
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
