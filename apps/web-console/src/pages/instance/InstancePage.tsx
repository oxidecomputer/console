import React from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import { useApiData, api } from '@oxide/api'

import {
  Breadcrumbs,
  Button,
  Card,
  Icon,
  InstanceDetails,
  PageHeader,
  Tabs,
  TextWithIcon,
} from '@oxide/ui'

import { InstancePageTables } from './InstancePageTables'

const Wrapper = styled.div``

const Title = styled(TextWithIcon).attrs({
  text: { variant: 'title', as: 'h1' },
  icon: { name: 'dashboard' },
})`
  text-transform: uppercase;
`

const InstanceAction = styled(Button).attrs({
  size: 'xs',
  variant: 'ghost',
})``

const PageAction = styled(Button).attrs({
  size: 'xs',
  variant: 'outline',
})``

const Actions = styled.div`
  display: flex;

  ${PageAction} {
    margin-left: ${({ theme }) => theme.spacing(3)};
  }
`

const Metadata = styled.div`
  margin-top: ${({ theme }) => theme.spacing(3)};
`

const StyledTabs = styled(Tabs)`
  margin-top: ${({ theme }) => theme.spacing(4)};
`

const CardList = styled.div`
  display: flex;
  flex-wrap: wrap;
  ${({ theme }) => theme.spaceBetweenX(4)}
  margin: -${({ theme }) => theme.spacing(2)};

  > * {
    margin: ${({ theme }) => theme.spacing(2)};
  }
`
const OverviewPanel = styled.div``

type Params = {
  projectName: string
  instanceName: string
}

const InstancePage = () => {
  const { projectName, instanceName } = useParams<Params>()

  const { data, error } = useApiData(api.apiProjectInstancesGetInstance, {
    instanceName,
    projectName,
  })

  if (error) {
    if (error.status === 404) {
      return <div>Instance not found</div>
    } else {
      return <div>loading</div>
    }
  }
  if (!data) return <div>loading</div>

  const breadcrumbs = [
    { href: '/', label: 'Maze War' },
    { href: '/projects', label: 'Projects' },
    { href: `/projects/${projectName}`, label: projectName },
    { href: `/projects/${projectName}/instances`, label: 'Instances' },
    { label: instanceName },
  ]

  return (
    <Wrapper>
      <Breadcrumbs data={breadcrumbs} />
      <PageHeader>
        <Title>{instanceName}</Title>
        <Actions>
          <InstanceAction>
            <TextWithIcon icon={{ name: 'pen' }}>Edit</TextWithIcon>
          </InstanceAction>
          <InstanceAction>
            <TextWithIcon icon={{ name: 'stopwatch' }}>Reset</TextWithIcon>
          </InstanceAction>
          <InstanceAction>
            <TextWithIcon icon={{ name: 'playStopO' }}>Stop</TextWithIcon>
          </InstanceAction>
          <InstanceAction>
            <TextWithIcon icon={{ name: 'playPauseO' }}>Suspend</TextWithIcon>
          </InstanceAction>
          <InstanceAction>
            <TextWithIcon icon={{ name: 'trash' }}>Delete</TextWithIcon>
          </InstanceAction>
          <PageAction>SSH</PageAction>
          <PageAction>
            <Icon name="more" />
          </PageAction>
        </Actions>
      </PageHeader>
      <Metadata>
        <InstanceDetails
          cpu="2"
          memory="8 GB"
          storage="100 GB"
          vm={{ os: 'Debian', version: '9.12', arch: 'x64' }}
          hostname="db1.useast1.inst"
          ip="10.10.16.7"
        />
      </Metadata>
      <StyledTabs
        label="Instance Page"
        tabs={['Overview', 'Metrics', 'Activity', 'Access & IAM', 'Settings']}
      >
        <OverviewPanel>
          <div>
            <CardList>
              <Card title="Metrics" subtitle="Some status update" />
              <Card title="Activity" subtitle="Some status update" />
              <Card title="Access & IAM" subtitle="Some status update" />
            </CardList>
          </div>
          <InstancePageTables />
        </OverviewPanel>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </StyledTabs>
    </Wrapper>
  )
}

export default InstancePage
