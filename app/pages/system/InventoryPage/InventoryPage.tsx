import { PageHeader, PageTitle, Racks24Icon } from '@oxide/ui'

import { RouteTabs, Tab } from 'app/components/RouteTabs'
import { pb } from 'app/util/path-builder'

export function InventoryPage() {
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Racks24Icon />}>Inventory</PageTitle>
      </PageHeader>

      <RouteTabs fullWidth>
        <Tab to={pb.rackInventory()}>Racks</Tab>
        <Tab to={pb.sledInventory()}>Sleds</Tab>
        <Tab to={pb.diskInventory()}>Disks</Tab>
      </RouteTabs>
    </>
  )
}
