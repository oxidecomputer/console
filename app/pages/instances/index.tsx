import { useQueryTable } from '@oxide/table'
import {
  Instances24Icon,
  PageHeader,
  PageTitle,
  PropertiesTable,
  Tabs,
  Tab,
} from '@oxide/ui'
import { useApiQuery } from '@oxide/api'
import React from 'react'
import { useParams } from '../../hooks'
import { InstanceStatusBadge } from '../../components/StatusBadge'
import filesize from 'filesize'
import Storage from './Storage'
import Metrics from './Metrics'

export const InstancePage = () => {
  const {
    orgName: organizationName,
    projectName,
    instanceName,
  } = useParams('orgName', 'projectName', 'instanceName')
  // const { Table, Column } = useQueryTable('projectInstancesGetInstance', {
  //   organizationName,
  //   projectName,
  //   instanceName,
  // })

  const { data: instance } = useApiQuery('projectInstancesGetInstance', {
    organizationName,
    projectName,
    instanceName,
  })

  if (!instance) return null

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Instances24Icon title="Instances" />}>
          {instanceName}
        </PageTitle>
      </PageHeader>
      <PropertiesTable.Group className="my-12">
        <PropertiesTable>
          <PropertiesTable.Row label="cpu">
            {instance.ncpus}
            <span className="text-gray-300"> vCPUs</span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="ram">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(filesize(instance.memory, { output: 'object' }) as any).value}
            <span className="text-gray-300"> GiB</span>
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
          <Storage />
        </Tab.Panel>
        <Tab>Metrics</Tab>
        <Tab.Panel>
          <Metrics />
        </Tab.Panel>
      </Tabs>
    </>
  )
}
