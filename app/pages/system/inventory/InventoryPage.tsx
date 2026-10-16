/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { queryClient } from '@oxide/api'
import { Servers16Icon, Servers24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { RefreshButton } from '~/components/RefreshButton'
import { RouteTabs, Tab } from '~/components/RouteTabs'
import { makeCrumb } from '~/hooks/use-crumbs'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

export const handle = makeCrumb('Inventory', pb.sledInventory())

// covers both tabs. Sled slots come from Nexus's periodic inventory
// collection, so they can lag behind physical changes
const refreshData = () =>
  Promise.all([
    queryClient.invalidateEndpoint('sledList'),
    queryClient.invalidateEndpoint('physicalDiskList'),
  ])

export default function InventoryPage() {
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Servers24Icon />}>Inventory</PageTitle>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={refreshData} />
          <DocsPopover
            heading="inventory"
            icon={<Servers16Icon />}
            summary="Information about the physical sleds and disks in the Oxide rack."
            links={[docLinks.sleds, docLinks.storage]}
          />
        </div>
      </PageHeader>

      <RouteTabs fullWidth>
        <Tab to={pb.sledInventory()}>Sleds</Tab>
        <Tab to={pb.diskInventory()}>Disks</Tab>
      </RouteTabs>
    </>
  )
}
