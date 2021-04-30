import React from 'react'
import styled from 'styled-components'
import { useParams, Link } from 'react-router-dom'
import filesize from 'filesize'

import { useApi } from '@oxide/api'
import { Breadcrumbs, PageHeader, Table, TextWithIcon } from '@oxide/ui'
import { useBreadcrumbs } from '../../hooks'
import { marginY } from '@oxide/css-helpers'

const Title = styled(TextWithIcon).attrs({
  text: { variant: 'title', as: 'h1' },
  icon: { name: 'instances' },
})``

const TableWrapper = styled.div`
  height: 300px;
  ${marginY(3)};
`

type Params = {
  projectName: string
}

const InstancesPage = () => {
  const breadcrumbs = useBreadcrumbs()

  const { projectName } = useParams<Params>()
  const { data: instances } = useApi('apiProjectInstancesGet', { projectName })

  if (!instances) return <div>loading</div>

  return (
    <>
      <Breadcrumbs data={breadcrumbs} />
      <PageHeader>
        <Title>Instances for Project: {projectName}</Title>
      </PageHeader>
      <TableWrapper>
        <Table
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
      </TableWrapper>
      <Link
        style={{ marginTop: '1rem' }}
        to={`/projects/${projectName}/instances/new`}
      >
        Create instance
      </Link>
    </>
  )
}

export default InstancesPage
