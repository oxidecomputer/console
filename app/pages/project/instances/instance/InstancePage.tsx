import React from 'react'
import filesize from 'filesize'
import { useNavigate } from 'react-router-dom'

import {
  ActionMenu,
  Instances24Icon,
  PageHeader,
  PageTitle,
  PropertiesTable,
  Tabs,
  Tab,
} from '@oxide/ui'
import { useApiQuery, useApiQueryClient } from '@oxide/api'
import { pick } from '@oxide/util'
import { useParams, useActionMenuState } from 'app/hooks'
import { InstanceStatusBadge } from 'app/components/StatusBadge'
import { StorageTab } from './tabs/StorageTab'
import { MetricsTab } from './tabs/MetricsTab'
import { useMakeInstanceActions } from '../actions'

export const InstancePage = () => {
  const instanceParams = useParams('orgName', 'projectName', 'instanceName')

  const navigate = useNavigate()
  const queryClient = useApiQueryClient()
  const actionMenuProps = useActionMenuState()
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

  if (!instance) return null

  const actions = makeActions(instance)
    // in the quick menu we do not show disabled actions
    .filter((a) => !a.disabled)
    // append "instance" to labels
    // TODO: if these were in an "Instance actions" subsection they might not
    // need the suffix for clarity
    .map((a) => ({ onSelect: a.onActivate, label: `${a.label} instance` }))

  const memory = filesize(instance.memory, { output: 'object', base: 2 })

  return (
    <>
      <ActionMenu {...actionMenuProps} ariaLabel="Instance quick actions">
        {actions.map(({ label, onSelect }) => (
          <ActionMenu.Item onSelect={onSelect} key={label}>
            {label}
          </ActionMenu.Item>
        ))}
      </ActionMenu>
      <PageHeader>
        <PageTitle icon={<Instances24Icon title="Instances" />}>
          {instanceParams.instanceName}
        </PageTitle>
      </PageHeader>
      <PropertiesTable.Group className="mb-16">
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
