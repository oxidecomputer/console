import React from 'react'
import { useParams, useHistory } from 'react-router-dom'

import { instanceCan, useApiQuery, useApiMutation } from '@oxide/api'

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

import { InstanceDetails } from '../components/InstanceDetails'
import { useBreadcrumbs, useToast } from '../hooks'

const InstanceAction = (props: {
  icon: IconName
  children: React.ReactNode
  onClick?: () => void
}) => (
  <Button
    size="xs"
    variant="dim"
    className="inline-flex"
    onClick={props.onClick}
  >
    <Icon name={props.icon} className="mr-2" />
    {props.children}
  </Button>
)

const pageAction: ButtonProps = { size: 'xs', variant: 'dim' }

type Params = {
  projectName: string
  instanceName: string
}

const InstancePage = () => {
  const history = useHistory()
  const breadcrumbs = useBreadcrumbs()
  const addToast = useToast()
  const { projectName, instanceName } = useParams<Params>()

  const {
    data: instance,
    error,
    refetch,
  } = useApiQuery(
    'projectInstancesGetInstance',
    {
      instanceName,
      projectName,
    },
    { refetchInterval: 5000 }
  )

  const stopInstance = useApiMutation('projectInstancesInstanceStop', {
    onSuccess: () => {
      refetch()
      addToast({
        type: 'default',
        title: `Instance '${instanceName}' stopped.`,
        timeout: 5000,
      })
    },
  })

  const deleteInstance = useApiMutation('projectInstancesDeleteInstance', {
    onSuccess: () => {
      addToast({
        type: 'default',
        title: `Instance '${instanceName}' deleted.`,
        timeout: 5000,
      })
      history.push(`/projects/${projectName}`)
    },
  })

  const rebootInstance = useApiMutation('projectInstancesInstanceReboot', {
    onSuccess: () => {
      refetch()
    },
  })

  if (error) {
    if (error.raw.status === 404) {
      return <div>Instance not found</div>
    } else {
      return <div>loading</div>
    }
  }
  if (!instance) return <div>loading</div>

  const handleStop = () => {
    if (instanceCan.stop(instance)) {
      stopInstance.mutate({
        instanceName: instance.name,
        projectName,
      })
    } else {
      addToast({
        type: 'default',
        title: 'Only a running instance can be stopped',
        timeout: 5000,
      })
    }
  }

  const handleDelete = () => {
    if (instanceCan.delete(instance)) {
      deleteInstance.mutate({
        instanceName: instance.name,
        projectName,
      })
    } else {
      addToast({
        type: 'default',
        title: 'Only a stopped instance can be deleted',
        timeout: 5000,
      })
    }
  }

  const handleReboot = () => {
    if (instanceCan.reboot(instance)) {
      rebootInstance.mutate({
        instanceName: instance.name,
        projectName,
      })
    } else {
      addToast({
        type: 'default',
        title: 'Only a running instance can be rebooted',
        timeout: 5000,
      })
    }
  }

  return (
    <div>
      <Breadcrumbs data={breadcrumbs} />
      <PageHeader>
        <PageTitle icon="resources">{instance.name}</PageTitle>
        <div className="flex space-x-2">
          <InstanceAction icon="pen">Edit</InstanceAction>
          <InstanceAction icon="stopwatch" onClick={handleReboot}>
            Reboot
          </InstanceAction>
          <InstanceAction icon="playStopO" onClick={handleStop}>
            Stop
          </InstanceAction>
          <InstanceAction icon="playPauseO">Suspend</InstanceAction>
          <InstanceAction icon="trash" onClick={handleDelete}>
            Delete
          </InstanceAction>
          <Button {...pageAction} className="!ml-4">
            SSH
          </Button>
          <Button {...pageAction}>
            <Icon name="more" />
          </Button>
        </div>
      </PageHeader>
      <div className="mt-3">
        <InstanceDetails instance={instance} />
      </div>
      <Tabs
        className="mt-4"
        fullWidth
        label="Instance Page"
        tabs={['Overview', 'Metrics', 'Activity', 'Access & IAM', 'Settings']}
      >
        <div>
          <div>
            <div className="flex flex-wrap mt-4 gap-4">
              <Card title="Metrics" subtitle="Some status update" />
              <Card title="Activity" subtitle="Some status update" />
              <Card title="Access & IAM" subtitle="Some status update" />
            </div>
          </div>
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
