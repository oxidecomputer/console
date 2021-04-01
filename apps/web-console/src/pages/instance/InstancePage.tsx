import React from 'react'
// import { useParams } from 'react-router-dom'
import styled from 'styled-components'

// import { useApiData, api } from '@oxide/api'

import {
  Breadcrumbs,
  Button,
  Card,
  Icon,
  InstanceDetails,
  Tabs,
  TextWithIcon,
} from '@oxide/ui'

import { InstancePageTables } from './InstancePageTables'

const breadcrumbs = [
  { href: '/', label: 'Maze War' },
  { href: '/first', label: 'Projects' },
  { href: '/second', label: 'prod-online' },
  { href: '/projects/prod-online/instances', label: 'Instances' },
  { label: 'DB1' },
]

const Wrapper = styled.div``

const Header = styled.header`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  margin-top: ${({ theme }) => theme.spacing(2)};
`

const Title = styled(TextWithIcon).attrs({
  text: { variant: 'title', as: 'h1' },
  icon: {
    name: 'instance',
  },
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

// type Params = {
//   projectName: string
//   instanceName: string
// }

const InstancePage = () => {
  // const { projectName, instanceName } = useParams<Params>()

  // const { data } = useApiData(api.apiProjectInstancesGetInstance, {
  //   instanceName,
  //   projectName,
  // })

  // if (!data) return <div>loading</div>

  return (
    <Wrapper>
      <Breadcrumbs data={breadcrumbs} />
      <Header>
        <Title>DB1</Title>
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
      </Header>
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
