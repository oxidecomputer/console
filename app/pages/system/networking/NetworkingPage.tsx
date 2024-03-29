/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Networking24Icon } from '@oxide/design-system/icons/react'

import { RouteTabs, Tab } from '~/components/RouteTabs'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { pb } from '~/util/path-builder'

export function NetworkingPage() {
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>Networking</PageTitle>
      </PageHeader>
      <RouteTabs fullWidth>
        <Tab to={pb.ipPools()}>IP pools</Tab>
      </RouteTabs>
    </>
  )
}
