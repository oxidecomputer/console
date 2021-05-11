import React from 'react'
import { useParams } from 'react-router-dom'
import tw, { styled } from 'twin.macro'

import { useApiQuery } from '@oxide/api'

import type { IconName } from '@oxide/ui'
import {
  Breadcrumbs,
  Button,
  Card,
  Icon,
  InstanceDetails,
  PageHeader,
  PageTitle,
  Tabs,
  TextWithIcon,
} from '@oxide/ui'

import { InstancePageTables } from './InstancePageTables'
import { useBreadcrumbs } from '../../hooks'
import { spacing } from '@oxide/css-helpers'

const InstanceAction = (props: {
  icon: IconName
  children: React.ReactNode
}) => (
  <Button size="xs" variant="subtle">
    <TextWithIcon>
      <Icon name={props.icon} />
      {props.children}
    </TextWithIcon>
  </Button>
)

const PageAction = styled(Button).attrs({
  size: 'xs',
  variant: 'outline',
})``

const Metadata = styled.div`
  margin-top: ${spacing(3)};
`

const StyledTabs = styled(Tabs)`
  margin-top: ${spacing(4)};
`

const CardList = tw.div`flex flex-wrap space-x-4 -m-2`

const StyledCard = tw(Card)`m-2`

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
    if (error.raw.status === 404) {
      return <div>Instance not found</div>
    } else {
      return <div>loading</div>
    }
  }
  if (!instance) return <div>loading</div>

  return (
    <div>
      <Breadcrumbs data={breadcrumbs} />
      <PageHeader>
        <PageTitle icon="resources">{instance.name}</PageTitle>
        <div tw="flex space-x-2">
          <InstanceAction icon="pen">Edit</InstanceAction>
          <InstanceAction icon="stopwatch">Reset</InstanceAction>
          <InstanceAction icon="playStopO">Stop</InstanceAction>
          <InstanceAction icon="playPauseO">Suspend</InstanceAction>
          <InstanceAction icon="trash">Delete</InstanceAction>
          <PageAction tw="ml-4!">SSH</PageAction>
          <PageAction>
            <Icon name="more" />
          </PageAction>
        </div>
      </PageHeader>
      <Metadata>
        <InstanceDetails instance={instance} />
      </Metadata>
      <StyledTabs
        fullWidth
        label="Instance Page"
        tabs={['Overview', 'Metrics', 'Activity', 'Access & IAM', 'Settings']}
      >
        <div>
          <div>
            <CardList>
              <StyledCard title="Metrics" subtitle="Some status update" />
              <StyledCard title="Activity" subtitle="Some status update" />
              <StyledCard title="Access & IAM" subtitle="Some status update" />
            </CardList>
          </div>
          <InstancePageTables />
        </div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </StyledTabs>
    </div>
  )
}

export default InstancePage
