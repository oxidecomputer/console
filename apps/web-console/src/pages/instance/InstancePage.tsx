import React from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import { useApiQuery } from '@oxide/api'

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
import { useBreadcrumbs } from '../../hooks'
import { spaceBetweenX, spacing } from '@oxide/css-helpers'

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
    margin-left: ${spacing(3)};
  }
`

const Metadata = styled.div`
  margin-top: ${spacing(3)};
`

const StyledTabs = styled(Tabs)`
  margin-top: ${spacing(4)};
`

const CardList = styled.div`
  display: flex;
  flex-wrap: wrap;
  ${spaceBetweenX(4)}
  margin: -${spacing(2)};

  > * {
    margin: ${spacing(2)};
  }
`
const OverviewPanel = styled.div``

type Params = {
  projectName: string
  instanceName: string
}

const InstancePage = () => {
  const breadcrumbs = useBreadcrumbs()
  const { projectName, instanceName } = useParams<Params>()

  const { data: instance, error } = useApiQuery(
    'apiProjectInstancesGetInstance',
    {
      instanceName,
      projectName,
    }
  )

  if (error) {
    if (error.status === 404) {
      return <div>Instance not found</div>
    } else {
      return <div>loading</div>
    }
  }
  if (!instance) return <div>loading</div>

  return (
    <Wrapper>
      <Breadcrumbs data={breadcrumbs} />
      <PageHeader>
        <Title>{instance.name} [DEPLOY TEST]</Title>
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
        <InstanceDetails instance={instance} />
      </Metadata>
      <StyledTabs
        fullWidth
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
