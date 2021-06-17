import type { ReactNode } from 'react'
import React, { useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  TabsKeyboardActivation,
} from '@reach/tabs'
import tw, { css } from 'twin.macro'

import { useApiQuery, useApiMutation } from '@oxide/api'

import type { IconName, ButtonProps } from '@oxide/ui'
import {
  Breadcrumbs,
  Button,
  Card,
  Icon,
  PageHeader,
  PageTitle,
} from '@oxide/ui'

import { InstanceDetails } from '../../components/instance-details/InstanceDetails'
import { InstancePageTables } from './InstancePageTables'
import { useBreadcrumbs, useToast } from '../../hooks'
import { useEffect } from 'react'

const InstanceAction = (props: {
  icon: IconName
  children: React.ReactNode
  onClick?: () => void
}) => (
  <Button size="xs" variant="subtle" tw="inline-flex" onClick={props.onClick}>
    <Icon name={props.icon} tw="mr-2" />
    {props.children}
  </Button>
)

const pageAction: ButtonProps = { size: 'xs', variant: 'outline' }

type Params = {
  projectName: string
  instanceName: string
  tab: string
}

type TabButtonProps = { children: ReactNode }
const TabButton = ({ children }: TabButtonProps) => (
  <Tab
    as={Button}
    variant="ghost"
    tw="flex-1 border-0 border-b border-current text-green-50 hover:text-green-500"
  >
    {children}
  </Tab>
)

const selectedTabStyle = css`
  [data-reach-tab][data-selected] {
    ${tw`text-green-500`}
  }
`

const tabs = [
  { label: 'Overview', path: '/' },
  { label: 'Metrics', path: '/metrics' },
  { label: 'Activity', path: '/activity' },
  { label: 'Access & IAM', path: '/access' },
  { label: 'Settings', path: '/settings' },
]

const getTabIndex = (slug: string) =>
  tabs.findIndex((t) => t.path === `/${slug || ''}`)

const InstancePage = () => {
  const history = useHistory()
  const breadcrumbs = useBreadcrumbs()
  const addToast = useToast()
  const { projectName, instanceName, tab } = useParams<Params>()
  const [tabIndex, setTabIndex] = useState(getTabIndex(tab))

  useEffect(() => {
    setTabIndex(getTabIndex(tab))
  }, [tab])

  const onChangeTab = (i: number) => {
    history.replace(
      `/projects/${projectName}/instances/${instanceName}${tabs[i].path}`
    )
  }

  const {
    data: instance,
    error,
    refetch,
  } = useApiQuery(
    'apiProjectInstancesGetInstance',
    {
      instanceName,
      projectName,
    },
    { refetchInterval: 5000 }
  )

  const stopInstance = useApiMutation('apiProjectInstancesInstanceStop', {
    onSuccess: () => {
      refetch()
      addToast({
        type: 'default',
        title: `Instance '${instanceName}' stopped.`,
        timeout: 5000,
      })
    },
  })

  const deleteInstance = useApiMutation('apiProjectInstancesDeleteInstance', {
    onSuccess: () => {
      addToast({
        type: 'default',
        title: `Instance '${instanceName}' deleted.`,
        timeout: 5000,
      })
      history.push(`/projects/${projectName}/instances`)
    },
  })

  const rebootInstance = useApiMutation('apiProjectInstancesInstanceReboot', {
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
    if (instance.runState === 'running') {
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
    if (instance.runState === 'stopped') {
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
    if (instance.runState === 'running') {
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
        <div tw="flex space-x-2">
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
        css={selectedTabStyle}
        keyboardActivation={TabsKeyboardActivation.Manual}
        index={tabIndex}
        onChange={onChangeTab}
      >
        <TabList tw="flex space-x-3">
          <TabButton>Overview</TabButton>
          <TabButton>Metrics</TabButton>
          <TabButton>Activity</TabButton>
          <TabButton>Access &amp; IAM</TabButton>
          <TabButton>Settings</TabButton>
        </TabList>
        <TabPanels>
          <TabPanel>
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
            <InstancePageTables />
          </TabPanel>
          <TabPanel>Metrics</TabPanel>
          <TabPanel>Activity</TabPanel>
          <TabPanel>Access</TabPanel>
          <TabPanel>Settings</TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  )
}

export default InstancePage
