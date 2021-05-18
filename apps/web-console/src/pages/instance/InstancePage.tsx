import React from 'react'
import { useParams } from 'react-router-dom'
import 'twin.macro'

import { useApiQuery } from '@oxide/api'

import type { IconName, ButtonProps } from '@oxide/ui'
import {
  Breadcrumbs,
  Button,
  Card,
  Icon,
  PageHeader,
  PageTitle,
  Tabs,
} from '@oxide/ui'

import { InstanceDetails } from '../../components/instance-details/InstanceDetails'
import { InstancePageTables } from './InstancePageTables'
import { useBreadcrumbs } from '../../hooks'

const InstanceAction = (props: {
  icon: IconName
  children: React.ReactNode
}) => (
  <Button size="xs" variant="subtle" tw="inline-flex">
    <Icon name={props.icon} tw="mr-2" />
    {props.children}
  </Button>
)

const pageAction: ButtonProps = { size: 'xs', variant: 'outline' }

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
    },
    { refetchInterval: 5000 }
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
          <Button {...pageAction} tw="ml-4!">
            SSH
          </Button>
          <Button {...pageAction}>
            <Icon name="more" />
          </Button>
        </div>
      </PageHeader>
      <div tw="mt-3">
        <InstanceDetails instance={instance} />
      </div>
      <Tabs
        tw="mt-4"
        fullWidth
        label="Instance Page"
        tabs={['Overview', 'Metrics', 'Activity', 'Access & IAM', 'Settings']}
      >
        <div>
          <div>
            <div tw="flex flex-wrap">
              <Card
                tw="mt-4 mr-4"
                title="Metrics"
                subtitle="Some status update"
              />
              <Card
                tw="mt-4 mr-4"
                title="Activity"
                subtitle="Some status update"
              />
              <Card
                tw="mt-4"
                title="Access & IAM"
                subtitle="Some status update"
              />
            </div>
          </div>
          <InstancePageTables />
        </div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </Tabs>
    </div>
  )
}

export default InstancePage
