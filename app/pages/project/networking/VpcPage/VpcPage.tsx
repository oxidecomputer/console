import { format } from 'date-fns'

import { useApiQuery } from '@oxide/api'
import { Networking24Icon, PageHeader, PageTitle, PropertiesTable } from '@oxide/ui'

import { Tab, Tabs } from 'app/components/Tabs'
import { useParams } from 'app/hooks'

import { VpcFirewallRulesTab } from './tabs/VpcFirewallRulesTab'
import { VpcRoutersTab } from './tabs/VpcRoutersTab'
import { VpcSubnetsTab } from './tabs/VpcSubnetsTab'
import { VpcSystemRoutesTab } from './tabs/VpcSystemRoutesTab'

const formatDateTime = (d: Date) => format(d, 'MMM d, yyyy H:mm aa')

export const VpcPage = () => {
  const vpcParams = useParams('orgName', 'projectName', 'vpcName')
  const { data: vpc } = useApiQuery('projectVpcsGetVpc', vpcParams)

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>{vpc?.name || ''}</PageTitle>
      </PageHeader>
      <PropertiesTable.Group className="mb-16">
        <PropertiesTable>
          <PropertiesTable.Row label="Description">{vpc?.description}</PropertiesTable.Row>
          <PropertiesTable.Row label="DNS Name">{vpc?.dnsName}</PropertiesTable.Row>
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
      </Tabs>
    </>
  )
}
