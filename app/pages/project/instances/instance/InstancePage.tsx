import React, { useMemo } from 'react'
import filesize from 'filesize'
import { useNavigate } from 'react-router-dom'

import { PropertiesTable, Tabs, Tab } from '@oxide/ui'
import { useApiQuery, useApiQueryClient } from '@oxide/api'
import { pick } from '@oxide/util'
import { useParams, useQuickActions } from 'app/hooks'
import { InstanceStatusBadge } from 'app/components/StatusBadge'
import { StorageTab } from './tabs/StorageTab'
import { MetricsTab } from './tabs/MetricsTab'
import { useMakeInstanceActions } from '../actions'

export const InstancePage = () => {
  const instanceParams = useParams('orgName', 'projectName', 'instanceName')

  const navigate = useNavigate()
  const queryClient = useApiQueryClient()
  const projectParams = pick(instanceParams, 'projectName', 'orgName')
  const makeActions = useMakeInstanceActions(projectParams, {
    onSuccess: () => {
      queryClient.invalidateQueries(
        'projectInstancesGetInstance',
        instanceParams
      )
    },
    // go to project instances list since there's no more instance
    onDelete: () => navigate('..'),
  })

  const { data: instance } = useApiQuery(
    'projectInstancesGetInstance',
    instanceParams,
    { refetchInterval: 5000 }
  )
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
      <PropertiesTable.Group className="mb-16 -mt-8">
        <PropertiesTable>
          <PropertiesTable.Row label="cpu">
            {instance.ncpus}
            <span className="ml-1 text-tertiary"> vCPUs</span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="ram">
            {memory.value}
            <span className="ml-1 text-tertiary"> {memory.unit}</span>
          </PropertiesTable.Row>
        </PropertiesTable>
        <PropertiesTable>
          <PropertiesTable.Row label="dns name">
            {instance.hostname || '–'}
          </PropertiesTable.Row>
          <PropertiesTable.Row label="status">
            <InstanceStatusBadge status={instance.runState} />
          </PropertiesTable.Row>
        </PropertiesTable>
      </PropertiesTable.Group>
      <Tabs id="tabs-instance" fullWidth>
        <Tab>Storage</Tab>
        <Tab.Panel>
          <StorageTab />
        </Tab.Panel>
        <Tab>Metrics</Tab>
        <Tab.Panel>
          <MetricsTab />
        </Tab.Panel>
      </Tabs>
    </>
  )
}
