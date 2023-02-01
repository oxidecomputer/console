import { format } from 'date-fns'

import { apiQueryClient, useApiQuery } from '@oxide/api'
import { Badge, PageHeader, PageTitle, PropertiesTable, Racks24Icon } from '@oxide/ui'

import { RouteTabs, Tab } from 'app/components/RouteTabs'
import { pb } from 'app/util/path-builder'

InventoryPage.loader = async () => {
  await apiQueryClient.prefetchQuery('rackList', {
    query: { limit: 10 },
  })
  return null
}

export function InventoryPage() {
  const { data: racks } = useApiQuery('rackList', { query: { limit: 10 } })
  console.log(racks)
  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const rack = racks?.items[0]!
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Racks24Icon />}>Inventory</PageTitle>
      </PageHeader>

      <PropertiesTable.Group className="mb-16 -mt-8">
        <PropertiesTable>
          <PropertiesTable.Row label="rack id">
            <span className="text-secondary">{rack.id}</span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="location">
            <span className="text-secondary">Emeryville, CA</span>
            {/* <span className="ml-1 text-quaternary"> CA</span> */}
          </PropertiesTable.Row>
        </PropertiesTable>
        <PropertiesTable>
          <PropertiesTable.Row label="installed">
            <span className="text-secondary">
              {format(rack.timeCreated, 'MMM d, yyyy')}
            </span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="status">
            <Badge>Active</Badge>
          </PropertiesTable.Row>
        </PropertiesTable>
      </PropertiesTable.Group>

      <RouteTabs fullWidth>
        <Tab to={pb.sledInventory()}>Sleds</Tab>
        <Tab to={pb.diskInventory()}>Disks</Tab>
      </RouteTabs>
    </>
  )
}
