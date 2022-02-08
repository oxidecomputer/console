import React from 'react'
import { format } from 'date-fns'
import {
  Networking24Icon,
  PageHeader,
  PageTitle,
  PropertiesTable,
} from '@oxide/ui'
import { Tabs, Tab } from 'app/components/Tabs'
import { VpcSubnetsTab } from './tabs/VpcSubnetsTab'
import { VpcSystemRoutesTab } from './tabs/VpcSystemRoutesTab'
import { VpcRoutersTab } from './tabs/VpcRoutersTab'
import { useParams } from 'app/hooks'
import { VpcFirewallRulesTab } from './tabs/VpcFirewallRulesTab'
import { useApiQuery } from '@oxide/api'

const formatDateTime = (d: Date) => format(d, 'MMM d, yyyy H:mm aa')

export const VpcPage = () => {
  const vpcParams = useParams('orgName', 'projectName', 'vpcName')
  const { data: vpc } = useApiQuery('projectVpcsGetVpc', vpcParams)

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon title="Vpcs" />}>
          {vpcParams.vpcName}
        </PageTitle>
      </PageHeader>

      <PropertiesTable.Group className="mb-16">
        <PropertiesTable>
          <PropertiesTable.Row label="Description">
            {vpc?.description}
          </PropertiesTable.Row>
          <PropertiesTable.Row label="DNS Name">
            {vpc?.dnsName}
          </PropertiesTable.Row>
        </PropertiesTable>
        <PropertiesTable>
          <PropertiesTable.Row label="Creation Date">
            {vpc?.timeCreated && formatDateTime(vpc.timeCreated)}
          </PropertiesTable.Row>
          <PropertiesTable.Row label="Last Modified">
            {vpc?.timeModified && formatDateTime(vpc.timeModified)}
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
        <Tab.Panel>
          <VpcFirewallRulesTab />
        </Tab.Panel>
        <Tab>Gateways</Tab>
        <Tab.Panel>Not implemented</Tab.Panel>
      </Tabs>
    </>
  )
}
