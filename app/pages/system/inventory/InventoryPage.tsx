/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Servers16Icon, Servers24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { RouteTabs, Tab } from '~/components/RouteTabs'
import { makeCrumb } from '~/hooks/use-crumbs'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

export const handle = makeCrumb('Inventory', pb.sledInventory())

export default function InventoryPage() {
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Servers24Icon />}>Inventory</PageTitle>
        <DocsPopover
          heading="inventory"
          icon={<Servers16Icon />}
          summary="Information about the physical sleds and disks in the Oxide rack."
          links={[docLinks.sleds, docLinks.storage]}
        />
      </PageHeader>

      <RouteTabs fullWidth>
        <Tab to={pb.sledInventory()}>Sleds</Tab>
        <Tab to={pb.diskInventory()}>Disks</Tab>
      </RouteTabs>
    </>
  )
}
