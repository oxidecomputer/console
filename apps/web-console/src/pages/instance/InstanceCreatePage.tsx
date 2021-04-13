import React, { useState } from 'react'
import styled from 'styled-components'
import { useHistory, useParams } from 'react-router-dom'
import { v4 as uuid } from 'uuid'

import { api } from '@oxide/api'
import { Breadcrumbs, Button, Icon, PageHeader, TextWithIcon } from '@oxide/ui'
import { useBreadcrumbs } from '../../hooks'

const Title = styled(TextWithIcon).attrs({
  text: { variant: 'title', as: 'h1' },
  icon: { name: 'instance' },
})`
  ${Icon} {
    font-size: ${({ theme }) => theme.spacing(8)};
    margin-right: ${({ theme }) => theme.spacing(3)};
  }
`

type Params = {
  projectName: string
}

const createInstance = (projectName: string) =>
  api.apiProjectInstancesPost({
    projectName,
    apiInstanceCreateParams: {
      bootDiskSize: 1,
      description: `An instance in project: ${projectName}`,
      hostname: 'oxide.com',
      memory: 10,
      name: `i-${uuid().substr(0, 8)}`,
      ncpus: 2,
    },
  })

const InstancesPage = () => {
  const breadcrumbs = useBreadcrumbs()
  const history = useHistory()
  const { projectName } = useParams<Params>()
  const [posting, setPosting] = useState(false)

  const onCreateClick = async () => {
    setPosting(true)
    await createInstance(projectName)
    history.push(`/projects/${projectName}/instances`)
  }

  return (
    <>
      <Breadcrumbs data={breadcrumbs} />
      <PageHeader>
        <Title>Create Instance</Title>
      </PageHeader>
      <Button onClick={onCreateClick} style={{ marginTop: '1rem' }}>
        Create instance {posting && '[posting...]'}
      </Button>
    </>
  )
}

export default InstancesPage
