import React from 'react'
import {
  Folder24Icon,
  PageHeader,
  PageTitle,
  PropertiesTable,
  Tab,
  Tabs,
} from '@oxide/ui'
import { VpcSubnetsTab } from './tabs/VpcSubnetsTab'
import { VpcSystemRoutesTab } from './tabs/VpcSystemRoutesTab'
import { VpcRoutersTab } from './tabs/VpcRoutersTab'
import { useParams } from '../../../../hooks'

export const VpcPage = () => {
  const { vpcName } = useParams('vpcName')
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Folder24Icon title="Vpcs" />}>{vpcName}</PageTitle>
      </PageHeader>

      <PropertiesTable.Group className="mb-16">
        <PropertiesTable>
          <PropertiesTable.Row label="Description">
            Default network for the project
          </PropertiesTable.Row>
          <PropertiesTable.Row label="DNS Name">
            frontend-production-vpc
          </PropertiesTable.Row>
        </PropertiesTable>
        <PropertiesTable>
          <PropertiesTable.Row label="Creation Date">
            Default network for the project
          </PropertiesTable.Row>
          <PropertiesTable.Row label="Last Modified">
            Default network for the project
          </PropertiesTable.Row>
        </PropertiesTable>
      </PropertiesTable.Group>

      <Tabs id="tabs-vpc-sections" fullWidth>
        <Tab>Subnets</Tab>
        <Tab.Panel>
          <VpcSubnetsTab />
        </Tab.Panel>
        <Tab>System Routes</Tab>
        <Tab.Panel>
          <VpcSystemRoutesTab />
        </Tab.Panel>
        <Tab>Routers</Tab>
        <Tab.Panel>
          <VpcRoutersTab />
        </Tab.Panel>
        <Tab>Firewall Rules</Tab>
        <Tab.Panel>Not Implemented</Tab.Panel>
        <Tab>Gateways</Tab>
        <Tab.Panel>Not implemented</Tab.Panel>
      </Tabs>
    </>
  )
}
