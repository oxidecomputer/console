/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Monitoring24Icon } from '@oxide/design-system/icons/react'

import { RouteTabs, Tab } from '~/components/RouteTabs'
import { makeCrumb } from '~/hooks/use-crumbs'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { pb } from '~/util/path-builder'

export const handle = makeCrumb('Alerting', pb.alerts())

export default function AlertingPage() {
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Monitoring24Icon />}>Alerting</PageTitle>
      </PageHeader>

      <RouteTabs fullWidth>
        <Tab to={pb.alerts()}>Alerts</Tab>
        <Tab to={pb.alertReceivers()}>Receivers</Tab>
      </RouteTabs>
    </>
  )
}
