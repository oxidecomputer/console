/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { apiQueryClient, useApiQuery } from '@oxide/api'
import { PageHeader, PageTitle, Racks24Icon } from '@oxide/ui'

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
  const rack = racks?.items[0]

  if (!rack) return null

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Racks24Icon />}>Inventory</PageTitle>
      </PageHeader>

      <RouteTabs fullWidth>
        <Tab to={pb.sledInventory()}>Sleds</Tab>
        <Tab to={pb.diskInventory()}>Disks</Tab>
      </RouteTabs>
    </>
  )
}
