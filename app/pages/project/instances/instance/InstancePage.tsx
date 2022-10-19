import filesize from 'filesize'
import React, { Suspense, memo, useMemo } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { apiQueryClient, useApiQuery, useApiQueryClient } from '@oxide/api'
import { Instances24Icon, PageHeader, PageTitle, PropertiesTable, Tab } from '@oxide/ui'
import { pick } from '@oxide/util'

import { MoreActionsMenu } from 'app/components/MoreActionsMenu'
import { InstanceStatusBadge } from 'app/components/StatusBadge'
import { Tabs } from 'app/components/Tabs'
import { requireInstanceParams, useQuickActions, useRequiredParams } from 'app/hooks'
import { pb } from 'app/util/path-builder'

import { useMakeInstanceActions } from '../actions'
import { NetworkingTab } from './tabs/NetworkingTab'
import { SerialConsoleTab } from './tabs/SerialConsoleTab'
import { StorageTab } from './tabs/StorageTab'

const MetricsTab = React.lazy(() => import('./tabs/MetricsTab'))

const InstanceTabs = memo(() => (
  <Tabs id="tabs-instance" fullWidth>
    <Tab>Storage</Tab>
    <Tab.Panel>
      <StorageTab />
    </Tab.Panel>
    <Tab>Metrics</Tab>
    <Tab.Panel>
      <Suspense fallback={null}>
        <MetricsTab />
      </Suspense>
    </Tab.Panel>
    <Tab>Networking</Tab>
    <Tab.Panel>
      <NetworkingTab />
    </Tab.Panel>
    <Tab>Serial Console</Tab>
    <Tab.Panel>
      <SerialConsoleTab />
    </Tab.Panel>
  </Tabs>
))

InstancePage.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('instanceView', {
    path: requireInstanceParams(params),
  })
}

export function InstancePage() {
  const instanceParams = useRequiredParams('orgName', 'projectName', 'instanceName')

  const navigate = useNavigate()
  const queryClient = useApiQueryClient()
  const projectParams = pick(instanceParams, 'projectName', 'orgName')
  const makeActions = useMakeInstanceActions(projectParams, {
    onSuccess: () => {
      queryClient.invalidateQueries('instanceView', { path: instanceParams })
    },
    // go to project instances list since there's no more instance
    onDelete: () => navigate(pb.instances(projectParams)),
  })

  const { data: instance } = useApiQuery('instanceView', { path: instanceParams })
  const actions = useMemo(
    () => (instance ? makeActions(instance) : []),
    [instance, makeActions]
  )
  const quickActions = useMemo(
    () =>
      actions
        // in the quick menu we do not show disabled actions
        .filter((a) => !a.disabled)
        // append "instance" to labels
        // TODO: if these were in an "Instance actions" subsection they might not
        // need the suffix for clarity
        .map((a) => ({ onSelect: a.onActivate, value: `${a.label} instance` })),
    [actions]
  )
  useQuickActions(quickActions)

  if (!instance) return null

  const memory = filesize(instance.memory, { output: 'object', base: 2 })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Instances24Icon />}>{instance.name}</PageTitle>
        <MoreActionsMenu label="Instance actions" actions={actions} />
      </PageHeader>
      <PropertiesTable.Group className="mb-16 -mt-8">
        <PropertiesTable>
          <PropertiesTable.Row label="cpu">
            <span className="text-secondary">{instance.ncpus}</span>
            <span className="ml-1 text-quaternary"> vCPUs</span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="ram">
            <span className="text-secondary">{memory.value}</span>
            <span className="ml-1 text-quaternary"> {memory.unit}</span>
          </PropertiesTable.Row>
        </PropertiesTable>
        <PropertiesTable>
          <PropertiesTable.Row label="dns name">
            <span className="text-secondary">{instance.hostname || '–'}</span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="status">
            <InstanceStatusBadge status={instance.runState} />
          </PropertiesTable.Row>
        </PropertiesTable>
      </PropertiesTable.Group>
      <InstanceTabs />
    </>
  )
}
